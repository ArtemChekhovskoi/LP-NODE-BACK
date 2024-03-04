import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import { MEASUREMENT_CODES } from "@constants/measurements";
import { UsersDailySleep } from "@models/users_daily_sleep";
import { UsersDailyActivity } from "@models/users_daily_activity";
import { Measurements } from "@models/measurements";
import { getMeasurementsScale } from "@controllers/patterns/helpers/getMeasurementsScale";
import isBetween from "dayjs/plugin/isBetween";
import dayjs from "dayjs";

dayjs.extend(isBetween);

interface RequestQuery {
	date: string;
}

interface SleepValue {
	value: string;
	startDate: Date;
	endDate: Date;
}

const MINUTES_IN_DAY = 1440;

const getDailyHeartRateDependencies = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		data: {},
	};

	try {
		const { usersID } = req;
		let { date } = req.query as unknown as RequestQuery;

		if (!date) {
			date = dayjs().format("YYYY-MM-DD");
		}

		const startOfTheDay = getStartOfDay(new Date(date));
		const startOfPrevDay = dayjs(startOfTheDay).subtract(1, "day").toDate();

		const [heartRateConfig, usersHeartRate, usersDailySleep] = await Promise.all([
			Measurements.findOne(
				{ code: MEASUREMENT_CODES.HEART_RATE },
				{ code: true, name: true, unit: true, precision: true, _id: true }
			).lean(),
			UsersDailyMeasurements.find(
				{ usersID, date: startOfTheDay, measurementCode: MEASUREMENT_CODES.HEART_RATE },
				{ value: true, startDate: true, endDate: true, _id: false }
			)
				.lean()
				.sort({ startDate: 1 }),
			UsersDailySleep.find({ usersID, date: { $in: [startOfPrevDay, startOfTheDay] } }).lean(),
			UsersDailyActivity.find({ usersID, date: startOfTheDay }).lean(),
		]);

		if (!heartRateConfig) {
			throw new Error("No heart rate config found");
		}

		let sleepBySourceName: SleepValue[] = [];
		if (usersDailySleep && usersDailySleep.length) {
			const sleepReducedBySourceName = usersDailySleep.reduce(
				(acc, item) => {
					if (!item.sourceName) return acc;
					if (!acc[item.sourceName]) {
						acc[item.sourceName] = [item];
						return acc;
					}
					acc[item.sourceName].push(item);
					return acc;
				},
				{} as { [sourceName: string]: SleepValue[] }
			);
			// eslint-disable-next-line prefer-destructuring
			sleepBySourceName = Object.values(sleepReducedBySourceName)[0];
		}

		const sleepWithPercentages = sleepBySourceName
			.map((sleep) => {
				if (dayjs(sleep.startDate).isBefore(dayjs(startOfTheDay)) && dayjs(sleep.endDate).isBefore(dayjs(startOfTheDay))) {
					return;
				}
				const sleepStart = dayjs(sleep.startDate).isBefore(startOfTheDay) ? dayjs(startOfTheDay) : dayjs(sleep.startDate);

				const sleepDuration = dayjs(sleep.endDate).diff(sleepStart, "minute");
				const sleepStartPercentage = (dayjs(sleepStart).diff(startOfTheDay, "minute") / MINUTES_IN_DAY).toFixed(2);
				let sleepEndPercentage = +(+sleepStartPercentage + sleepDuration / MINUTES_IN_DAY).toFixed(2);
				if (sleepEndPercentage > 1) {
					sleepEndPercentage = 1.0;
				}
				// eslint-disable-next-line consistent-return
				return {
					startPercentage: +sleepStartPercentage,
					endPercentage: +sleepEndPercentage,
				};
			})
			.filter((sleep) => sleep);

		const heartRatePrepared = [
			{
				unit: heartRateConfig.unit,
				precision: heartRateConfig.precision,
				code: heartRateConfig.code,
				name: heartRateConfig.name,
				measurements: usersHeartRate,
			},
		];

		const [heartRateWithScales] = getMeasurementsScale(heartRatePrepared);
		if (!usersHeartRate || usersHeartRate.length === 0) {
			responseJSON.data = heartRateWithScales;
			return res.status(200).json(responseJSON);
		}

		let dayTime = dayjs(startOfTheDay);
		const heartRateWithZeroValues = [];

		// eslint-disable-next-line no-restricted-syntax
		for (const heartRate of heartRateWithScales.measurements) {
			while (!dayjs(heartRate.startDate).isBetween(dayTime, dayTime.add(30, "minutes"))) {
				heartRateWithZeroValues.push({
					value: 0,
					startDate: dayTime.toDate(),
					endDate: dayTime.add(30, "minutes").toDate(),
				});
				if (dayTime.isAfter(dayjs(new Date(date)).endOf("day"))) {
					break;
				}
				dayTime = dayTime.add(30, "minutes");
			}
			heartRateWithZeroValues.push(heartRate);
			dayTime = dayTime.add(30, "minutes");
		}

		responseJSON.data = {
			heartRate: { ...heartRateWithScales, measurements: heartRateWithZeroValues },
			sleep: sleepWithPercentages,
			activity: {},
		};
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error in getDailyHeartRateDependencies: ${e}`, e);
		return res.status(500).json(responseJSON);
	}
};

export default getDailyHeartRateDependencies;

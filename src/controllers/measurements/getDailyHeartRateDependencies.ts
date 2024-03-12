import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { ACTIVE_MEASUREMENTS } from "@constants/measurements";
import { UsersSleep } from "@models/users_sleep";
import { UsersActivity } from "@models/users_activity";
import { Measurements } from "@models/measurements";
import { getMeasurementsScale } from "@controllers/patterns/helpers/getMeasurementsScale";
import isBetween from "dayjs/plugin/isBetween";
import dayjs from "dayjs";
import { UsersHeartRate } from "@models/users_heart_rate";
import filterMeasurementsByPeriod from "@controllers/measurements/helpers/filterMeasurementsByPeriod";

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
const SLEEP_VALUES_TO_INCLUDE = ["RAW", "DEEP", "CORE"];

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
		const endOfTheDay = dayjs(startOfTheDay).utc().endOf("day").toDate();
		const startOfPrevDay = dayjs(startOfTheDay).subtract(1, "day").toDate();

		const [heartRateConfig, usersHeartRate, usersDailySleep] = await Promise.all([
			Measurements.findOne(
				{ code: ACTIVE_MEASUREMENTS.HEART_RATE_VARIABILITY },
				{ code: true, name: true, unit: true, precision: true, _id: true }
			).lean(),
			UsersHeartRate.find(
				{ usersID, startDate: { $gte: startOfTheDay }, endDate: { $lte: endOfTheDay } },
				{ value: true, startDate: true, endDate: true, _id: false }
			)
				.lean()
				.sort({ startDate: 1 }),
			UsersSleep.find(
				{ usersID, startDate: { $gte: startOfPrevDay }, endDate: { $lte: endOfTheDay } },
				{ value: true, startDate: true, endDate: true, sourceName: true, _id: false }
			)
				.lean()
				.sort({ startDate: 1 }),
			UsersActivity.find({ usersID, startDate: { $gte: startOfPrevDay }, endDate: { $lte: endOfTheDay } }).lean(),
		]);

		if (!usersHeartRate || usersHeartRate.length === 0) {
			responseJSON.data = {
				heartRate: { measurements: [] },
				sleep: [],
				activity: [],
			};
			return res.status(200).json(responseJSON);
		}

		if (!heartRateConfig) {
			throw new Error("No heart rate config found");
		}

		let sleepBySourceName: SleepValue[] = [];
		if (usersDailySleep && usersDailySleep.length) {
			const sleepReducedBySourceName = usersDailySleep.reduce(
				(acc, item) => {
					if (!item.sourceName) return acc;
					if (!SLEEP_VALUES_TO_INCLUDE.includes(item?.value)) return acc;
					if (!acc[item.sourceName]) {
						acc[item.sourceName] = [item];
						return acc;
					}
					acc[item.sourceName].push(item);
					return acc;
				},
				{} as { [sourceName: string]: SleepValue[] }
			);
			const sourceIndexWithMoreInfo = Object.values(sleepReducedBySourceName)
				.map((a) => a.length)
				.indexOf(Math.max(...Object.values(sleepReducedBySourceName).map((a) => a.length)));
			sleepBySourceName = Object.values(sleepReducedBySourceName)[sourceIndexWithMoreInfo];
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

		const everyHalfAndHourHeartRate = filterMeasurementsByPeriod(usersHeartRate, 30);
		const heartRatePrepared = [
			{
				unit: heartRateConfig.unit,
				precision: heartRateConfig.precision,
				code: heartRateConfig.code,
				name: heartRateConfig.name,
				measurements: everyHalfAndHourHeartRate,
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
			while (!dayjs(heartRate?.startDate).isBetween(dayTime, dayTime.add(30, "minutes"))) {
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

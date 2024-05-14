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
import { ActivitiesConfig } from "@models/activities_config";
import calculateMeasurementPercentages from "@controllers/measurements/helpers/calculateMeasurementPercentages";
import calculateSleepPercentages from "@helpers/calculateSleepPercentages";

dayjs.extend(isBetween);

interface RequestQuery {
	date: string;
}

export interface SleepValue {
	value: number;
	startDate: Date;
	endDate: Date;
}

const SLEEP_VALUES_TO_INCLUDE = [0, 1, 2, 3, 4, 5];

const getDailyHeartRateDependencies = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		data: {
			heartRate: {},
			sleep: {},
			activity: {},
		},
	};

	try {
		const { usersID } = req;
		let { date } = req.query as unknown as RequestQuery;

		if (!date) {
			date = dayjs().format("YYYY-MM-DD");
		}

		const startOfTheDay = getStartOfDay(new Date(date));
		const endOfTheDay = dayjs(startOfTheDay).utc().endOf("day").toDate();
		const NinePMPrevDay = dayjs(startOfTheDay).subtract(3, "hours").toDate();

		const [heartRateConfig, usersHeartRate, usersDailySleep, usersActivity, activitiesConfig] = await Promise.all([
			Measurements.findOne(
				{ code: ACTIVE_MEASUREMENTS.AVG_HEART_RATE },
				{ code: true, name: true, unit: true, precision: true, displayColor: true, _id: true }
			).lean(),
			UsersHeartRate.find(
				{ usersID, startDate: { $gte: startOfTheDay }, endDate: { $lte: endOfTheDay } },
				{ value: true, startDate: true, endDate: true, _id: false }
			)
				.lean()
				.sort({ startDate: 1 }),
			UsersSleep.find(
				{ usersID, startDate: { $gte: NinePMPrevDay }, endDate: { $lte: endOfTheDay } },
				{ value: true, startDate: true, endDate: true, sourceName: true, _id: false }
			)
				.lean()
				.sort({ startDate: 1 }),
			UsersActivity.find({ usersID, startDate: { $gte: NinePMPrevDay }, endDate: { $lte: endOfTheDay } }).lean(),
			ActivitiesConfig.find({}),
		]);

		if (!usersHeartRate || usersHeartRate.length === 0) {
			return res.status(200).json(responseJSON);
		}

		if (!heartRateConfig || !activitiesConfig || !activitiesConfig?.length) {
			throw new Error("No heart rate or activities config found");
		}

		let sleepBySourceName: SleepValue[] = [];
		if (usersDailySleep && usersDailySleep.length > 0) {
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
			if (Object.keys(sleepReducedBySourceName).length === 1) {
				const [onlyOneSetOfMeasurements] = Object.values(sleepReducedBySourceName);
				sleepBySourceName = onlyOneSetOfMeasurements;
			}
			if (Object.keys(sleepReducedBySourceName).length > 0) {
				const sourceIndexWithMoreInfo = Object.values(sleepReducedBySourceName)
					.map((a) => a.length)
					.indexOf(Math.max(...Object.values(sleepReducedBySourceName).map((a) => a.length)));
				sleepBySourceName = Object.values(sleepReducedBySourceName)[sourceIndexWithMoreInfo];
			}
		}

		const sleepWithPercentages = calculateSleepPercentages(sleepBySourceName, startOfTheDay);
		const activityWithPercentages = usersActivity.map((activity) => {
			const { startPercentage, endPercentage } = calculateMeasurementPercentages(activity, startOfTheDay);
			const activityConfig = activitiesConfig.find((config) => config.code === activity.activityType);
			return {
				startPercentage,
				endPercentage,
				activityName: activityConfig?.fullName,
				emoji: activityConfig?.emoji,
			};
		});
		const everyHalfAndHourHeartRate = filterMeasurementsByPeriod(usersHeartRate, 30);
		const heartRatePrepared = [
			{
				unit: heartRateConfig.unit,
				precision: heartRateConfig.precision,
				displayColor: heartRateConfig.displayColor,
				code: heartRateConfig.code,
				name: heartRateConfig.name,
				measurements: everyHalfAndHourHeartRate,
			},
		];

		const [heartRateWithScales] = getMeasurementsScale(heartRatePrepared, "maxValue");
		if (!usersHeartRate || usersHeartRate.length === 0) {
			responseJSON.data = {
				heartRate: { ...heartRateWithScales, measurements: [] },
				sleep: sleepWithPercentages,
				activity: {},
			};
			return res.status(200).json(responseJSON);
		}

		let dayTime = dayjs(startOfTheDay);
		const heartRateWithZeroValues = [];

		// Insert heart rate empty values for the missing half-hour periods
		for (const heartRate of heartRateWithScales.measurements) {
			while (!dayjs(heartRate?.startDate).add(1, "minutes").isBetween(dayTime, dayTime.add(30, "minutes"))) {
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

		// Insert heart rate empty values to the end of the day
		while (dayTime.isBefore(dayjs(new Date(date)).endOf("day"))) {
			heartRateWithZeroValues.push({
				value: 0,
				startDate: dayTime.toDate(),
				endDate: dayTime.add(30, "minutes").toDate(),
			});
			dayTime = dayTime.add(30, "minutes");
		}
		responseJSON.data = {
			heartRate: { ...heartRateWithScales, measurements: heartRateWithZeroValues },
			sleep: sleepWithPercentages,
			activity: activityWithPercentages,
		};
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error in getDailyHeartRateDependencies: ${e}`, e);
		return res.status(500).json(responseJSON);
	}
};

export default getDailyHeartRateDependencies;

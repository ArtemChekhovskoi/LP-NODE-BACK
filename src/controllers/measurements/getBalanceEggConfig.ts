import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";

import { MINUTES_IN_DAY, ACTIVE_MEASUREMENTS } from "@constants/measurements";
import generateDatesArray from "@helpers/generateDatesArray";
import { decimalAdjust } from "@helpers/decimalAdjust";
import getStartOfDay from "@helpers/getStartOfTheDay";
import dayjs from "dayjs";
import getReducedMeasurementsConfig from "@controllers/measurements/helpers/getReducedMeasurementsConfig";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";

interface RequestQuery {
	startDate: string;
	endDate: string;
}

interface IResponseData {
	date: Date;
	activity: {
		time: number;
		calories: number;
	};
	sleep: {
		time: number;
	};
	inactive: {
		time: number;
	};
}
const getBalanceEggConfig = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		data: [] as IResponseData[],
	};
	try {
		const { usersID } = req;
		const { startDate, endDate } = req.query as unknown as RequestQuery;

		if (!usersID) {
			throw new Error("usersID couldn't be found");
		}

		const startOfTheDay = getStartOfDay(new Date(startDate));
		const endDateEndOfDay = dayjs(getStartOfDay(new Date(endDate)))
			.utc()
			.endOf("day")
			.toDate();
		const datesArray = generateDatesArray(startOfTheDay, endDateEndOfDay);
		const [dailyMeasurementsSum, reducedMeasurementsConfig] = await Promise.all([
			UsersDailyMeasurementsSum.find(
				{
					measurementCode: {
						$in: [
							ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_DURATION,
							ACTIVE_MEASUREMENTS.DAILY_CALORIES_BURNED,
							ACTIVE_MEASUREMENTS.SLEEP_DURATION,
						],
					},
					usersID,
					date: { $in: datesArray },
				},
				{ value: true, date: true, measurementCode: true, _id: false }
			)
				.sort({ date: -1 })
				.lean(),
			getReducedMeasurementsConfig(),
		]);
		const groupedMeasurements = dailyMeasurementsSum.reduce(
			(acc, item) => {
				if (!acc[item.measurementCode]) {
					acc[item.measurementCode] = [item];
				} else {
					acc[item.measurementCode] = [...acc[item.measurementCode], item];
				}
				return acc;
			},
			{
				[ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_DURATION]: [],
				[ACTIVE_MEASUREMENTS.DAILY_CALORIES_BURNED]: [],
				[ACTIVE_MEASUREMENTS.SLEEP_DURATION]: [],
			} as { [key: string]: { value: number; date: Date }[] | [] }
		);

		const sleepPrecision = reducedMeasurementsConfig[ACTIVE_MEASUREMENTS.SLEEP_DURATION].precision || 2;
		const activityPrecision = reducedMeasurementsConfig[ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_DURATION].precision || 2;
		const inactivePrecision = reducedMeasurementsConfig[ACTIVE_MEASUREMENTS.SLEEP_DURATION].precision || 2;

		const data = datesArray
			.map((date) => {
				const sleepDurationByDate = groupedMeasurements[ACTIVE_MEASUREMENTS.SLEEP_DURATION].find(
					(item) => item.date.toISOString() === date.toISOString()
				);
				const activityDurationByDate = groupedMeasurements[ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_DURATION].find(
					(item) => item.date.toISOString() === date.toISOString()
				);
				const caloriesBurnedByDate = groupedMeasurements[ACTIVE_MEASUREMENTS.DAILY_CALORIES_BURNED].find(
					(item) => item.date.toISOString() === date.toISOString()
				);
				const sleepTime = sleepDurationByDate?.value || 0;
				const activityTime = activityDurationByDate?.value || 0;
				const inactiveTime = MINUTES_IN_DAY - sleepTime - activityTime;

				return {
					date,
					activity: {
						time: decimalAdjust(activityTime, activityPrecision),
						calories: decimalAdjust(caloriesBurnedByDate?.value || 0, 0),
					},
					sleep: {
						time: decimalAdjust(sleepTime, sleepPrecision),
					},
					inactive: {
						time: decimalAdjust(inactiveTime, inactivePrecision),
					},
				};
			})
			.reverse();
		responseJSON.data = data;
		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/getBalanceEggConfig: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default getBalanceEggConfig;

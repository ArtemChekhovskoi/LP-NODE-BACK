import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";

import { HOURS_IN_DAY, ACTIVE_MEASUREMENTS } from "@constants/measurements";
import generateDatesArray from "@helpers/generateDatesArray";
import { decimalAdjust } from "@helpers/decimalAdjust";
import getStartOfDay from "@helpers/getStartOfTheDay";
import dayjs from "dayjs";
import getReducedMeasurementsConfig from "@controllers/measurements/helpers/getReducedMeasurementsConfig";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";
import { TUsersSteps, UsersSteps } from "@models/users_steps";
import { TUsersActivity, UsersActivity } from "@models/users_activity";

interface RequestQuery {
	startDate: string;
	endDate: string;
}

interface IResponseData {
	date: Date;
	activity: {
		time: number;
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

		const [dailySleepDuration, stepsRawData, activityRawData, reducedMeasurementsConfig] = await Promise.all([
			UsersDailyMeasurementsSum.find(
				{
					measurementCode: ACTIVE_MEASUREMENTS.SLEEP_DURATION,
					usersID,
					date: { $in: datesArray },
				},
				{ value: true, date: true, measurementCode: true, _id: false }
			)
				.sort({ date: -1 })
				.lean(),
			UsersSteps.find({
				usersID,
				startDate: { $gte: startOfTheDay, $lte: endDateEndOfDay },
			}).lean(),
			UsersActivity.find({
				usersID,
				startDate: { $gte: startOfTheDay, $lte: endDateEndOfDay },
			}).lean(),
			getReducedMeasurementsConfig(),
		]);

		const stepsByDates = stepsRawData.reduce(
			(acc, item) => {
				const date = getStartOfDay(item.startDate).toISOString();
				if (!acc[date]) {
					acc[date] = [];
				}
				acc[date].push(item);
				return acc;
			},
			{} as Record<string, TUsersSteps[]>
		);

		const activitiesByDates = activityRawData.reduce(
			(acc, item) => {
				const date = getStartOfDay(item.startDate).toISOString();
				if (!acc[date]) {
					acc[date] = [];
				}
				acc[date].push(item);
				return acc;
			},
			{} as Record<string, TUsersActivity[]>
		);

		const activityDurationByDate = Object.entries(stepsByDates).map(([date, steps]) => {
			const stepsDuration = steps.reduce((acc, item) => acc + dayjs(item.endDate).diff(item.startDate), 0);
			const activities = activitiesByDates[date];
			if (!activities) {
				return {
					date: new Date(date),
					totalDuration: stepsDuration,
				};
			}

			const activityDuration = activities.reduce((acc, item) => acc + dayjs(item.endDate).diff(item.startDate), 0);
			let totalDuration = stepsDuration + activityDuration;
			steps.forEach((step) => {
				const stepEnd = dayjs(step.endDate);
				const stepStart = dayjs(step.startDate);
				activities.forEach((activity) => {
					const activityEnd = dayjs(activity.endDate);
					const activityStart = dayjs(activity.startDate);
					const isStepInActivity = stepStart.isAfter(activityStart) && stepEnd.isBefore(activityEnd);
					if (isStepInActivity) {
						totalDuration -= stepEnd.diff(stepStart);
						return;
					}
					const isStepEndsInActivity = stepEnd.isAfter(activityStart) && stepStart.isBefore(activityStart);
					if (isStepEndsInActivity) {
						totalDuration -= stepEnd.diff(activityStart);
						return;
					}
					const isStepStartsInActivity = stepEnd.isAfter(activityEnd) && stepStart.isBefore(activityEnd);
					if (isStepStartsInActivity) {
						totalDuration -= activityEnd.diff(stepStart);
					}
				});
			});
			return {
				date: new Date(date),
				totalDuration,
			};
		});

		const sleepPrecision = reducedMeasurementsConfig[ACTIVE_MEASUREMENTS.SLEEP_DURATION].precision || 2;
		const activityPrecision = reducedMeasurementsConfig[ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_DURATION].precision || 2;
		const inactivePrecision = reducedMeasurementsConfig[ACTIVE_MEASUREMENTS.SLEEP_DURATION].precision || 2;

		const data = datesArray
			.map((date) => {
				const sleepDuration = dailySleepDuration.find((item) => item.date.toISOString() === date.toISOString());
				const activityDuration = activityDurationByDate.find((item) => item.date.toISOString() === date.toISOString());

				const sleepTime = sleepDuration?.value || 0;
				const activityTime = activityDuration?.totalDuration ? activityDuration.totalDuration / 1000 / 60 / 60 : 0;
				const inactiveTime = HOURS_IN_DAY - sleepTime - activityTime;

				return {
					date,
					activity: {
						time: decimalAdjust(activityTime, activityPrecision),
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
		logger.error(`Error at controllers/measurements/getBalanceEggConfig: ${e}`, e);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default getBalanceEggConfig;

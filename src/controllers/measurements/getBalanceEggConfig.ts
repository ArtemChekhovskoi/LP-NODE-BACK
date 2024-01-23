import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";

import { UsersDailyActivity } from "@models/users_daily_activity";
import { UsersDailySleep } from "@models/users_daily_sleep";
import { MINUTES_IN_DAY, SLEEP_VALUES } from "@constants/measurements";
import generateDatesArray from "@helpers/generateDatesArray";

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
	notTracked: {
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

		const [activity, sleep] = await Promise.all([
			UsersDailyActivity.find({
				usersID,
				date: { $gte: new Date(startDate), $lte: new Date(endDate) },
			}).lean(),
			UsersDailySleep.find({
				usersID,
				value: SLEEP_VALUES.ASLEEP,
				date: { $gte: new Date(startDate), $lte: new Date(endDate) },
			}).lean(),
		]);
		const datesArray = generateDatesArray(new Date(startDate), new Date(endDate));
		const data = datesArray
			.map((date) => {
				let inactiveTime = 0;
				let sleepTime = 0;
				let activityTime = 0;
				let notTrackedTime = MINUTES_IN_DAY;

				const activitySample = activity.filter((activityItem) => activityItem.date.toISOString() === date.toISOString());
				const sleepSample = sleep.filter((sleepItem) => sleepItem.date.toISOString() === date.toISOString());

				if (activitySample.length && sleepSample.length) {
					sleepTime = 500;
					activityTime = activitySample[0].exerciseTimeMinutes;
					inactiveTime = MINUTES_IN_DAY - sleepTime - activityTime;
					notTrackedTime = 0;
				}

				if (!activitySample.length && sleepSample.length) {
					sleepTime = 500;
					inactiveTime = MINUTES_IN_DAY - sleepTime;
					notTrackedTime = 0;
				}

				if (!sleepSample.length && activitySample.length) {
					activityTime = activitySample[0].exerciseTimeMinutes;
					inactiveTime = MINUTES_IN_DAY - activityTime;
					notTrackedTime = 0;
				}

				return {
					date,
					activity: {
						time: activityTime,
						calories: activitySample[0]?.activeEnergyBurned || 0,
					},
					sleep: {
						time: sleepTime,
					},
					inactive: {
						time: inactiveTime,
					},
					notTracked: {
						time: notTrackedTime,
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

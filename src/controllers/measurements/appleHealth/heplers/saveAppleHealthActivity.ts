import { logger } from "@logger/index";
import { ClientSession, Types } from "mongoose";
import { UsersActivity } from "@models/users_activity";
import { ACTIVE_MEASUREMENTS } from "@constants/measurements";
import getStartOfDay from "@helpers/getStartOfTheDay";
import dayjs from "dayjs";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";

const { ObjectId } = Types;

export interface IActivitySample {
	startDate: Date;
	endDate: Date;
	value: number;
}

interface IActivityTotals {
	[date: string]: {
		dailyActiveEnergyBurned: number;
		dailyActivityTimeMinutes: number;
	};
}
const saveAppleHealthActivity = async (activity: IActivitySample[], usersID: string, mongoSession: ClientSession) => {
	logger.info(`Start postUpdateActivity. Activity length: ${activity?.length}. Example: ${JSON.stringify(activity)}`);

	if (!activity || activity.length === 0) {
		throw new Error("No activity data");
	}
	const activityTotals = activity.reduce((acc, curr) => {
		const date = getStartOfDay(curr.startDate).toISOString();
		const periodActivityMinutes = dayjs(curr.endDate).diff(dayjs(curr.startDate), "minutes");
		if (!acc[date]) {
			acc[date] = {
				dailyActiveEnergyBurned: curr.value,
				dailyActivityTimeMinutes: periodActivityMinutes,
			};
		} else {
			acc[date].dailyActiveEnergyBurned += curr.value;
			acc[date].dailyActivityTimeMinutes += periodActivityMinutes;
		}
		return acc;
	}, {} as IActivityTotals);
	const dailyActivityBulkWrite = Object.entries(activityTotals)
		.map(([date, measurement]) => {
			return [
				{
					updateOne: {
						filter: {
							date: new Date(date),
							usersID: new ObjectId(usersID),
							measurementCode: ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_DURATION,
						},
						update: {
							$inc: {
								value: measurement.dailyActivityTimeMinutes,
							},
							$set: {
								lastUpdated: new Date(),
							},
						},
						upsert: true,
					},
				},
				{
					updateOne: {
						filter: {
							date: new Date(date),
							usersID: new ObjectId(usersID),
							measurementCode: ACTIVE_MEASUREMENTS.DAILY_CALORIES_BURNED,
						},
						update: {
							$inc: {
								value: measurement.dailyActiveEnergyBurned,
							},
							$set: {
								lastUpdated: new Date(),
							},
						},
						upsert: true,
					},
				},
			];
		})
		.flat();
	const activityBulkWrite = activity.map((measurement) => ({
		updateOne: {
			filter: {
				usersID: new ObjectId(usersID),
				startDate: new Date(measurement.startDate),
			},
			update: {
				$set: {
					endDate: new Date(measurement.endDate),
					activeEnergyBurned: measurement.value,
					lastUpdated: new Date(),
				},
			},
			upsert: true,
		},
	}));

	await UsersActivity.bulkWrite(activityBulkWrite, { session: mongoSession });
	await UsersDailyMeasurementsSum.bulkWrite(dailyActivityBulkWrite, { session: mongoSession });
	return true;
};

export default saveAppleHealthActivity;

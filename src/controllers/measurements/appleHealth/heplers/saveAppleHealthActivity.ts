import { Types } from "mongoose";
import { UsersActivity } from "@models/users_activity";
import { ACTIVE_MEASUREMENTS } from "@constants/measurements";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";
import dayjs from "dayjs";

const { ObjectId } = Types;

export interface IActivitySample {
	startDate: Date;
	endDate: Date;
	totalEnergyBurned: {
		unit: string;
		quantity: number;
	};
	totalDistance: null | number;
	workoutActivityType: number;
	duration: number;
}

interface IActivityTotals {
	[date: string]: {
		dailyActiveEnergyBurned: number;
		dailyActivityTimeHours: number;
	};
}
const saveAppleHealthActivity = (activity: IActivitySample[], usersID: string, utcOffset: number) => {
	if (!activity || activity.length === 0) {
		throw new Error("No activity data");
	}

	const activityWithCorrectDates = activity.map((measurement) => {
		return {
			...measurement,
			startDate: dayjs(measurement.startDate).add(utcOffset, "minute").toDate(),
			endDate: dayjs(measurement.endDate).add(utcOffset, "minute").toDate(),
		};
	});
	const activityTotals = activityWithCorrectDates.reduce((acc, curr) => {
		const date = getStartOfDay(curr.startDate).toISOString();
		const periodActivityHours = +(curr.duration / 3600).toFixed(2);
		if (!acc[date]) {
			acc[date] = {
				dailyActiveEnergyBurned: curr?.totalEnergyBurned?.quantity || 0,
				dailyActivityTimeHours: periodActivityHours,
			};
		} else {
			acc[date].dailyActiveEnergyBurned += curr?.totalEnergyBurned?.quantity || 0;
			acc[date].dailyActivityTimeHours += periodActivityHours;
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
								value: measurement.dailyActivityTimeHours,
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
	const activityBulkWrite = activityWithCorrectDates.map((measurement) => ({
		updateOne: {
			filter: {
				usersID: new ObjectId(usersID),
				startDate: new Date(measurement.startDate),
			},
			update: {
				$set: {
					endDate: new Date(measurement.endDate),
					activeEnergyBurned: measurement?.totalEnergyBurned?.quantity || 0,
					activityType: measurement.workoutActivityType,
					durationS: measurement.duration,
					lastUpdated: new Date(),
				},
			},
			upsert: true,
		},
	}));

	return [
		{
			data: activityBulkWrite,
			model: UsersActivity.collection.name,
		},
		{
			data: dailyActivityBulkWrite,
			model: UsersDailyMeasurementsSum.collection.name,
		},
	];
};

export default saveAppleHealthActivity;

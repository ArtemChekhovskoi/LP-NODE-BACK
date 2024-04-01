import { ACTIVE_MEASUREMENTS, HealthValue } from "@constants/measurements";
import { Types } from "mongoose";
import { UsersWalkingRunningDistance } from "@models/users_walking_running_distance";
import sumMeasurementsByDay from "@controllers/measurements/helpers/sumMeasurementsByDay";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";

const { ObjectId } = Types;

const saveAppleHealthWalkingRunningDistance = (walkingRunningDistance: HealthValue[], usersID: string) => {
	if (!walkingRunningDistance || walkingRunningDistance.length === 0) {
		throw new Error("No walkingRunningDistance data");
	}

	const dailyDistanceByDay = sumMeasurementsByDay(walkingRunningDistance);
	const dailyDistanceBulkWrite = dailyDistanceByDay.map((measurement) => {
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date: new Date(measurement.date),
					measurementCode: ACTIVE_MEASUREMENTS.DAILY_DISTANCE,
				},
				update: {
					$inc: {
						value: measurement.value,
					},
					$set: {
						lastUpdated: new Date(),
					},
				},
				upsert: true,
			},
		};
	});

	const distanceBulkWrite = walkingRunningDistance.map((measurement) => ({
		updateOne: {
			filter: {
				usersID: new ObjectId(usersID),
				startDate: new Date(measurement.startDate),
				sourceName: measurement?.sourceName,
			},
			update: {
				$set: {
					endDate: new Date(measurement.endDate),
					value: measurement.value,
					lastUpdated: new Date(),
				},
			},
			upsert: true,
		},
	}));

	return [
		{
			data: dailyDistanceBulkWrite,
			model: UsersDailyMeasurementsSum.collection.name,
		},
		{
			data: distanceBulkWrite,
			model: UsersWalkingRunningDistance.collection.name,
		},
	];
};

export default saveAppleHealthWalkingRunningDistance;

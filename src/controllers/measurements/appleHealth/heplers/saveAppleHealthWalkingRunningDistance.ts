import { ACTIVE_MEASUREMENTS, HealthValue } from "@constants/measurements";
import { Types } from "mongoose";
import { UsersWalkingRunningDistance } from "@models/users_walking_running_distance";
import sumMeasurementsByDay from "@controllers/measurements/helpers/sumMeasurementsByDay";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";
import dayjs from "dayjs";
import reduceMeasurementBySourceName from "@helpers/reduceMeasurementBySourceName";
import getStartOfDay from "@helpers/getStartOfTheDay";

const { ObjectId } = Types;

const saveAppleHealthWalkingRunningDistance = (walkingRunningDistance: HealthValue[], usersID: string, utcOffset: number) => {
	if (!walkingRunningDistance || walkingRunningDistance.length === 0) {
		throw new Error("No walkingRunningDistance data");
	}

	const walkingRunningDistanceWithCorrectDates = walkingRunningDistance.map((measurement) => {
		return {
			...measurement,
			startDate: dayjs(measurement.startDate).add(utcOffset, "minute").toDate(),
			endDate: dayjs(measurement.endDate).add(utcOffset, "minute").toDate(),
		};
	});

	const distanceWithBiggestLength = reduceMeasurementBySourceName(walkingRunningDistanceWithCorrectDates);
	const dailyDistanceByDay = sumMeasurementsByDay(distanceWithBiggestLength);

	const dailyDistanceBulkWrite = dailyDistanceByDay.map((measurement) => {
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date: new Date(measurement.date),
					measurementCode: ACTIVE_MEASUREMENTS.DAILY_DISTANCE,
					created: { $gte: getStartOfDay(measurement.date), $lt: dayjs(getStartOfDay(measurement.date)).add(1, "day").toDate() },
				},
				update: {
					$inc: {
						value: +(measurement.value / 1000).toFixed(2),
					},
					$set: {
						lastUpdated: new Date(),
					},
				},
				upsert: true,
			},
		};
	});

	const distanceBulkWrite = walkingRunningDistanceWithCorrectDates.map((measurement) => ({
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

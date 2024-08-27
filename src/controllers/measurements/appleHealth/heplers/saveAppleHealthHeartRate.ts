import { HealthValue } from "@constants/measurements";
import { UsersHeartRate } from "@models/users_heart_rate";
import { Types } from "mongoose";
import calculateMinMaxAvg from "@controllers/measurements/helpers/calculateMinMaxAvg";
import { UsersDailyHeartRate } from "@models/users_daily_heart_rate";
import dayjs from "dayjs";
import prepareMeasurementsByPeriod from "@controllers/measurements/helpers/prepareMeasurementsByPeriod";
import getStartOfDay from "@helpers/getStartOfTheDay";

const { ObjectId } = Types;

const saveAppleHealthHeartRate = async (heartRate: HealthValue[], usersID: string, utcOffset: number) => {
	if (!heartRate || heartRate.length === 0) {
		throw new Error("No heart rate data");
	}

	const heartRateWithCorrectDates = heartRate.map((measurement) => {
		return {
			...measurement,
			startDate: dayjs(measurement.startDate).add(utcOffset, "minute").toDate(),
			endDate: dayjs(measurement.endDate).add(utcOffset, "minute").toDate(),
		};
	});

	const heartRateByDate = heartRateWithCorrectDates.reduce(
		(acc, measurement) => {
			const date = new Date(measurement.startDate).toISOString().split("T")[0];
			if (!acc[date]) {
				acc[date] = [];
			}
			acc[date].push(measurement.value);
			return acc;
		},
		{} as Record<string, number[]>
	);

	const existingDailyHeartRate = await UsersDailyHeartRate.find({
		usersID: new ObjectId(usersID),
		date: { $in: Object.keys(heartRateByDate).map((date) => new Date(date)) },
	}).lean();
	const dailyHeartRateBulkWrite = Object.entries(heartRateByDate).map(([date, measurements]) => {
		const { min, max, avg, totalRecords } = calculateMinMaxAvg(measurements);
		const existingRecord = existingDailyHeartRate.find((record) => record.date.toISOString().split("T")[0] === date);
		const preparedDailyValues = { min, max, avg, totalRecords };
		if (existingRecord) {
			const prevAvg = existingRecord?.heartRate?.avg || 0;
			const prevTotalRecords = existingRecord.recordsScanned;
			preparedDailyValues.avg = (prevAvg * prevTotalRecords + avg * totalRecords) / (prevTotalRecords + totalRecords);
			preparedDailyValues.totalRecords = prevTotalRecords + totalRecords;
		}
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date: new Date(date),
					created: { $gte: getStartOfDay(date), $lt: dayjs(getStartOfDay(date)).add(1, "day").toDate() },
				},
				update: {
					$set: {
						"heartRate.avg": preparedDailyValues.avg,
						lastUpdated: new Date(),
					},
					$inc: {
						recordsScanned: totalRecords,
					},
					$max: {
						"heartRate.max": max,
					},
					$min: {
						"heartRate.min": min,
					},
				},
				upsert: true,
			},
		};
	});

	const heartRateForEvery30Minutes = prepareMeasurementsByPeriod(heartRateWithCorrectDates, 30);
	const heartRateBulkUpdateArray = heartRateForEvery30Minutes.map((measurement) => {
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					startDate: new Date(measurement.startDate),
					sourceName: measurement.sourceName,
				},
				update: {
					$set: {
						endDate: new Date(measurement.endDate),
						minValue: measurement.minValue,
						maxValue: measurement.maxValue,
						value: measurement.value,
						lastUpdated: new Date(),
					},
				},
				upsert: true,
			},
		};
	});

	return [
		{
			data: heartRateBulkUpdateArray,
			model: UsersHeartRate.collection.name,
		},
		{
			data: dailyHeartRateBulkWrite,
			model: UsersDailyHeartRate.collection.name,
		},
	];
};

export default saveAppleHealthHeartRate;

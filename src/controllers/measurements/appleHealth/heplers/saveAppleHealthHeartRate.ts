import { HealthValue } from "@constants/measurements";
import { UsersHeartRate } from "@models/users_heart_rate";
import { ClientSession, Types } from "mongoose";
import calculateMinMaxAvg from "@controllers/measurements/helpers/calculateMinMaxAvg";
import { UsersDailyHeartRate } from "@models/users_daily_heart_rate";

const { ObjectId } = Types;

const saveAppleHealthHeartRate = async (heartRate: HealthValue[], usersID: string, mongoSession: ClientSession) => {
	if (!heartRate || heartRate.length === 0) {
		throw new Error("No heart rate data");
	}

	const heartRateByDate = heartRate.reduce(
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

	const heartRateBulkUpdateArray = heartRate.map((measurement) => {
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
						value: measurement.value,
						lastUpdated: new Date(),
					},
				},
				upsert: true,
			},
		};
	});

	await UsersHeartRate.bulkWrite(heartRateBulkUpdateArray, { session: mongoSession });
	await UsersDailyHeartRate.bulkWrite(dailyHeartRateBulkWrite, { session: mongoSession });

	return true;
};

export default saveAppleHealthHeartRate;

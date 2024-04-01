import { Types } from "mongoose";
import { UsersSleep } from "@models/users_sleep";
import sumDailySleep from "@controllers/measurements/helpers/sumDailySleep";
import { ACTIVE_MEASUREMENTS } from "@constants/measurements";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";

const { ObjectId } = Types;

export interface ISleepSample {
	startDate: string | Date;
	endDate: string | Date;
	value: number;
	sourceName: string;
}
const saveAppleHealthSleep = (sleep: ISleepSample[], usersID: string) => {
	if (!sleep || sleep.length === 0) {
		throw new Error("No sleep data");
	}

	const sleepDuration = sumDailySleep(sleep);
	const sleepDurationBulkWrite = Object.entries(sleepDuration).map(([date, measurement]) => {
		return {
			updateOne: {
				filter: {
					date: new Date(date),
					usersID: new ObjectId(usersID),
					measurementCode: ACTIVE_MEASUREMENTS.SLEEP_DURATION,
				},
				update: {
					$inc: {
						value: measurement.duration,
					},
					$set: {
						lastUpdated: new Date(),
					},
				},
				upsert: true,
			},
		};
	});

	const sleepBulkWrite = sleep.map((measurement) => {
		return {
			updateOne: {
				filter: {
					startDate: new Date(measurement.startDate),
					sourceName: measurement?.sourceName,
					usersID: new ObjectId(usersID),
				},
				update: {
					value: measurement.value,
					endDate: new Date(measurement.endDate),
					lastUpdated: new Date(),
				},
				upsert: true,
			},
		};
	});

	return [
		{
			data: sleepBulkWrite,
			model: UsersSleep.collection.name,
		},
		{
			data: sleepDurationBulkWrite,
			model: UsersDailyMeasurementsSum.collection.name,
		},
	];
};

export default saveAppleHealthSleep;

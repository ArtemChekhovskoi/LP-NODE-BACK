import getStartOfDay from "@helpers/getStartOfTheDay";
import { ClientSession, Types } from "mongoose";
import { UsersDailyActivity } from "@models/users_daily_activity";
import { MEASUREMENT_CODES } from "@constants/measurements";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";

const { ObjectId } = Types;

interface IActivitySample {
	activeEnergyBurned: number;
	activeEnergyBurnedGoal: number;
	appleExerciseTime: number;
	appleExerciseTimeGoal: number;
	appleStandHours: number;
	appleStandHoursGoal: number;
	date: string;
	sourceName?: string;
}

const saveActivitySamples = async (samples: IActivitySample[], usersID: string, mongoSession: ClientSession) => {
	const usersDailyActivityArray = samples.map((sample) => {
		const startOfDay = getStartOfDay(sample.date);
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date: startOfDay,
				},
				update: {
					lastUpdated: new Date(),
					activeEnergyBurned: sample.activeEnergyBurned,
					exerciseTimeMinutes: sample.appleExerciseTime,
				},
				upsert: true,
			},
		};
	});
	const usersMeasurementsArray = samples.map((sample) => {
		const startOfDay = getStartOfDay(sample.date);
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date: startOfDay,
					measurementCode: MEASUREMENT_CODES.ACTIVITY,
				},
				update: {
					value: sample.appleExerciseTime,
					source: sample?.sourceName,
				},
				upsert: true,
			},
		};
	});

	await UsersDailyActivity.bulkWrite(usersDailyActivityArray, { session: mongoSession });
	await UsersDailyMeasurements.bulkWrite(usersMeasurementsArray, { session: mongoSession });
};

export { saveActivitySamples, IActivitySample };

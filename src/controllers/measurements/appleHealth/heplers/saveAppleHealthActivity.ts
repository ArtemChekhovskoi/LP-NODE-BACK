import { logger } from "@logger/index";
import { ClientSession, Types } from "mongoose";
import { UsersActivity } from "@models/users_activity";

const { ObjectId } = Types;

export interface IActivitySample {
	date: string | Date;
	activeEnergyBurned: number;
	appleExerciseTime: number;
	appleStandHours: number;
	sourceName: string;
}
const saveAppleHealthActivity = async (activity: IActivitySample[], usersID: string, mongoSession: ClientSession) => {
	logger.info(`Start postUpdateActivity. Activity length: ${activity?.length}. Example: ${JSON.stringify(activity)}`);

	if (!activity || activity.length === 0) {
		throw new Error("No activity data");
	}
	// TODO Check is date returned
	const activityBulkWrite = activity.map((measurement) => ({
		updateOne: {
			filter: {
				usersID: new ObjectId(usersID),
				date: new Date(measurement.date),
				sourceName: measurement?.sourceName,
			},
			update: {
				$set: {
					activeEnergyBurned: measurement.activeEnergyBurned,
					exerciseTimeMinutes: measurement.appleExerciseTime,
					standTimeHours: measurement.appleStandHours,

					lastUpdated: new Date(),
				},
			},
			upsert: true,
		},
	}));

	await UsersActivity.bulkWrite(activityBulkWrite, { session: mongoSession });

	return true;
};

export default saveAppleHealthActivity;

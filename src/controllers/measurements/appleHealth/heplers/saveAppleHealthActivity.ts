import { logger } from "@logger/index";
import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { IActivitySample, saveActivitySamples } from "@controllers/measurements/helpers/saveActivitySamples";
import { ClientSession } from "mongoose";

const saveAppleHealthActivity = async (
	activity: IActivitySample[],
	usersID: string,
	measurementsConfig: IMeasurementsConfig,
	mongoSession: ClientSession
) => {
	logger.info(`Start postUpdateActivity. Activity length: ${activity?.length}. Example: ${JSON.stringify(activity)}`);

	if (!activity || activity.length === 0) {
		throw new Error("No activity data");
	}

	await saveActivitySamples(activity, usersID, mongoSession);
	logger.info(`End postUpdateActivity`);

	return true;
};

export default saveAppleHealthActivity;

import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { ISleepSample, saveSleepSamples } from "@controllers/measurements/helpers/saveSleepSamples";
import { ClientSession } from "mongoose";

const saveAppleHealthSleep = async (
	sleep: ISleepSample[],
	usersID: string,
	measurementsConfig: IMeasurementsConfig,
	mongoSession: ClientSession
) => {
	if (!sleep || sleep.length === 0) {
		throw new Error("No sleep data");
	}

	await saveSleepSamples(sleep, usersID!, measurementsConfig, mongoSession);
	return true;
};

export default saveAppleHealthSleep;

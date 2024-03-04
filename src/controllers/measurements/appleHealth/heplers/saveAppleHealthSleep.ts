import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { ISleepSample, saveSleepSamples } from "@controllers/measurements/helpers/saveSleepSamples";
import { ClientSession } from "mongoose";
import { sleepExample } from "../../../../../examples/sleep";

const saveAppleHealthSleep = async (
	sleep: ISleepSample[],
	usersID: string,
	measurementsConfig: IMeasurementsConfig,
	mongoSession: ClientSession
) => {
	if (!sleep || sleep.length === 0) {
		throw new Error("No sleep data");
	}

	await saveSleepSamples(sleepExample, usersID!, measurementsConfig, mongoSession);
	return true;
};

export default saveAppleHealthSleep;

import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { HealthValue } from "@constants/measurements";
import saveSimpleAppleValueArray from "@controllers/measurements/helpers/saveSimpleAppleValueArray";
import { ClientSession } from "mongoose";

const saveAppleHealthWeight = async (
	weight: HealthValue[],
	usersID: string,
	measurementsConfig: IMeasurementsConfig,
	mongoSession: ClientSession
) => {
	if (!weight || weight.length === 0) {
		throw new Error("No weight data");
	}

	await saveSimpleAppleValueArray({ values: weight, measurementsConfig, usersID, mongoSession });

	return true;
};

export default saveAppleHealthWeight;

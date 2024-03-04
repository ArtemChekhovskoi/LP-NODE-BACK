import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { HealthValue } from "@constants/measurements";
import saveSimpleAppleValueArray from "@controllers/measurements/helpers/saveSimpleAppleValueArray";
import { ClientSession } from "mongoose";

const saveAppleHealthHeight = async (
	height: HealthValue[],
	usersID: string,
	measurementsConfig: IMeasurementsConfig,
	mongoSession: ClientSession
) => {
	if (!height || height.length === 0) {
		throw new Error("No height data");
	}

	await saveSimpleAppleValueArray({ values: height, measurementsConfig, usersID, mongoSession });
	return true;
};

export default saveAppleHealthHeight;

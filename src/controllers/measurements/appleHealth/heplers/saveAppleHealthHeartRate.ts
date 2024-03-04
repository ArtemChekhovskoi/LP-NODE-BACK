import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { HealthValue } from "@constants/measurements";
import saveSimpleAppleValueArray from "@controllers/measurements/helpers/saveSimpleAppleValueArray";
import filterMeasurementsByPeriod from "@controllers/measurements/helpers/filterMeasurementsByPeriod";
import { ClientSession } from "mongoose";

const saveAppleHealthHeartRate = async (
	heartRate: HealthValue[],
	usersID: string,
	measurementsConfig: IMeasurementsConfig,
	mongoSession: ClientSession
) => {
	if (!heartRate || heartRate.length === 0) {
		throw new Error("No heart rate data");
	}

	const filteredHeartRate = filterMeasurementsByPeriod(heartRate);

	await saveSimpleAppleValueArray({ values: filteredHeartRate, measurementsConfig, usersID, mongoSession });

	return true;
};

export default saveAppleHealthHeartRate;

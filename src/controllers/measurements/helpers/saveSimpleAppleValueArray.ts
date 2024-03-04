import { logger } from "@logger/index";
import createDatesObject, { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { HealthValue, MEASUREMENT_SOURCES } from "@constants/measurements";
import createMeasurementsUpdateObject from "@controllers/measurements/helpers/createMeasurementsUpdateObject";
import { ClientSession } from "mongoose";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";

interface ISaveSimpleAppleValueArrayParams {
	values: HealthValue[];
	measurementsConfig: IMeasurementsConfig;
	usersID: string;
	mongoSession: ClientSession;
}
const saveSimpleAppleValueArray = async ({ values, measurementsConfig, usersID, mongoSession }: ISaveSimpleAppleValueArrayParams) => {
	try {
		const measurementsArray = createDatesObject(values, measurementsConfig, MEASUREMENT_SOURCES.APPLE_HEALTH);

		const measurementsToUpdate = createMeasurementsUpdateObject(measurementsArray, usersID!);
		await UsersDailyMeasurements.bulkWrite(measurementsToUpdate, {
			session: mongoSession,
		});
	} catch (e: any) {
		logger.error(`Error at controllers/measurements/helpers/saveSimpleAppleValueArray: ${e}`, e);
		throw new Error(e);
	}
};

export default saveSimpleAppleValueArray;

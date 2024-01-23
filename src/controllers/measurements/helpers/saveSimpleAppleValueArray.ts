import { logger } from "@logger/index";
import createDatesObject, { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { HealthValue, MEASUREMENT_SOURCES } from "@constants/measurements";
import createMeasurementsUpdateObject from "@controllers/measurements/helpers/createMeasurementsUpdateObject";
import mongoose, { ClientSession } from "mongoose";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";

const saveSimpleAppleValueArray = async (values: HealthValue[], measurementsConfig: IMeasurementsConfig, usersID: string) => {
	let mongoSession: ClientSession | undefined;

	try {
		const measurementsArray = createDatesObject(values, measurementsConfig, MEASUREMENT_SOURCES.APPLE_HEALTH);

		const measurementsToUpdate = createMeasurementsUpdateObject(measurementsArray, usersID!);
		mongoSession = await mongoose.connection.startSession();
		await mongoSession.withTransaction(async () => {
			await UsersDailyMeasurements.bulkWrite(measurementsToUpdate, {
				session: mongoSession,
			});
		});
	} catch (e: any) {
		logger.error(`Error at controllers/measurements/helpers/saveSimpleAppleValueArray: ${e}`, e);
		throw new Error(e);
	} finally {
		if (mongoSession) {
			await mongoSession.endSession();
		}
	}
};

export default saveSimpleAppleValueArray;

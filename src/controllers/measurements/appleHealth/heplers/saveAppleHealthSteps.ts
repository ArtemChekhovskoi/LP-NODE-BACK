import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { HealthValue, MEASUREMENT_CODES } from "@constants/measurements";
import sumMeasurementsByDay from "@controllers/measurements/helpers/sumMeasurementsByDay";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import { ClientSession, Types } from "mongoose";

const { ObjectId } = Types;

const saveAppleHealthSteps = async (
	steps: HealthValue[],
	usersID: string,
	measurementsConfig: IMeasurementsConfig,
	mongoSession: ClientSession
) => {
	if (!steps || steps.length === 0) {
		throw new Error("No steps data");
	}

	const stepsPerDay = sumMeasurementsByDay(steps);
	const stepsBulkWrite = stepsPerDay.map((stepsByDate) => ({
		updateOne: {
			filter: { usersID: new ObjectId(usersID), measurementCode: MEASUREMENT_CODES.STEPS, date: new Date(stepsByDate.date) },
			update: {
				$inc: { value: stepsByDate.value },
				$set: { lastUpdated: new Date() },
			},
			upsert: true,
		},
	}));

	await UsersDailyMeasurements.bulkWrite(stepsBulkWrite, {
		session: mongoSession as ClientSession,
	});

	return true;
};

export default saveAppleHealthSteps;

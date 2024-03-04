import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { HealthValue, MEASUREMENT_CODES } from "@constants/measurements";
import sumMeasurementsByDay from "@controllers/measurements/helpers/sumMeasurementsByDay";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import { ClientSession, Types } from "mongoose";

const { ObjectId } = Types;

const saveAppleHealthWalkingRunningDistance = async (
	walkingRunningDistance: HealthValue[],
	usersID: string,
	measurementsConfig: IMeasurementsConfig,
	mongoSession: ClientSession
) => {
	if (!walkingRunningDistance || walkingRunningDistance.length === 0) {
		throw new Error("No walkingRunningDistance data");
	}

	const distancePerDay = sumMeasurementsByDay(walkingRunningDistance);
	const distanceBulkWrite = distancePerDay.map((distanceByDate) => ({
		updateOne: {
			filter: {
				usersID: new ObjectId(usersID),
				measurementCode: MEASUREMENT_CODES.WALKING_RUNNING_DISTANCE,
				date: new Date(distanceByDate.date),
			},
			update: {
				$inc: { value: distanceByDate.value },
				$set: { lastUpdated: new Date() },
			},
			upsert: true,
		},
	}));

	await UsersDailyMeasurements.bulkWrite(distanceBulkWrite, {
		session: mongoSession as ClientSession,
	});

	return true;
};

export default saveAppleHealthWalkingRunningDistance;

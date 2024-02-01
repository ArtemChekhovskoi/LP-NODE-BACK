import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { Measurements } from "@models/measurements";
import { HealthValue, MEASUREMENT_CODES } from "@constants/measurements";
import sumMeasurementsByDay from "@controllers/measurements/helpers/sumMeasurementsByDay";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import mongoose, { ClientSession, Types } from "mongoose";

const { ObjectId } = Types;

interface RequestBody {
	walkingRunningDistance: HealthValue[];
}
const postUpdateWalkingRunningDistance = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	let mongoSession: ClientSession | null = null;
	try {
		const { usersID } = req;
		const { walkingRunningDistance } = req.body as RequestBody;

		if (!walkingRunningDistance || walkingRunningDistance.length === 0) {
			responseJSON.error = "Nothing to sync";
			responseJSON.errorCode = "MISSING_DATA";
			return res.status(400).json(responseJSON);
		}

		const measurementsConfig = (await Measurements.findOne(
			{ code: MEASUREMENT_CODES.WALKING_RUNNING_DISTANCE },
			{ code: true, unit: true, _id: true }
		)) as IMeasurementsConfig;

		if (!measurementsConfig) {
			responseJSON.error = "No config found";
			responseJSON.errorCode = "NO_CONFIG_FOUND";
			return res.status(400).json(responseJSON);
		}

		const distancePerDay = sumMeasurementsByDay(walkingRunningDistance);
		const stepsBulkWrite = distancePerDay.map((distanceByDate) => ({
			updateOne: {
				filter: { usersID: new ObjectId(usersID), code: MEASUREMENT_CODES.STEPS, date: new Date(distanceByDate.date) },
				update: {
					$inc: { value: distanceByDate.value },
					$set: { lastUpdated: new Date() },
				},
				upsert: true,
			},
		}));

		mongoSession = await mongoose.connection.startSession();
		await mongoSession.withTransaction(async () => {
			await UsersDailyMeasurements.bulkWrite(stepsBulkWrite, {
				session: mongoSession as ClientSession,
			});
		});

		await mongoSession.endSession();

		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/appleHealth/postUpdateWalkingRunningDistance: ${e}`, e);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	} finally {
		if (mongoSession) {
			await mongoSession.endSession();
		}
	}
};

export default postUpdateWalkingRunningDistance;
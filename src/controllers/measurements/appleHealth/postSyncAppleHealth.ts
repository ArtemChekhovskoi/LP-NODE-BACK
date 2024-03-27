import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { HealthValue, RAW_MEASUREMENT_CODES, RAW_MEASUREMENT_CODES_ARRAY } from "@constants/measurements";
import mongoose, { ClientSession, Types } from "mongoose";
import saveAppleHealthHeight from "@controllers/measurements/appleHealth/heplers/saveAppleHealthHeight";
import saveAppleHealthWeight from "@controllers/measurements/appleHealth/heplers/saveAppleHealthWeight";
import saveAppleHealthWalkingRunningDistance from "@controllers/measurements/appleHealth/heplers/saveAppleHealthWalkingRunningDistance";
import saveAppleHealthSteps from "@controllers/measurements/appleHealth/heplers/saveAppleHealthSteps";
import saveAppleHealthSleep, { ISleepSample } from "@controllers/measurements/appleHealth/heplers/saveAppleHealthSleep";
import saveAppleHealthHeartRate from "@controllers/measurements/appleHealth/heplers/saveAppleHealthHeartRate";
import saveAppleHealthActivity, { IActivitySample } from "@controllers/measurements/appleHealth/heplers/saveAppleHealthActivity";
import { Users } from "@models/users";

const { ObjectId } = Types;

interface IMeasurementsObject {
	heartRate: HealthValue[] | null;
	height: HealthValue[] | null;
	weight: HealthValue[] | null;
	walkingRunningDistance: HealthValue[] | null;
	steps: HealthValue[] | null;
	activity: IActivitySample[] | null;
	sleep: ISleepSample[] | null;
}

const SYNC_STRATEGY = {
	[RAW_MEASUREMENT_CODES.HEART_RATE]: saveAppleHealthHeartRate,
	[RAW_MEASUREMENT_CODES.HEIGHT]: saveAppleHealthHeight,
	[RAW_MEASUREMENT_CODES.WEIGHT]: saveAppleHealthWeight,
	[RAW_MEASUREMENT_CODES.WALKING_RUNNING_DISTANCE]: saveAppleHealthWalkingRunningDistance,
	[RAW_MEASUREMENT_CODES.STEPS]: saveAppleHealthSteps,
	// [RAW_MEASUREMENT_CODES.ACTIVITY]: saveAppleHealthActivity,
	[RAW_MEASUREMENT_CODES.SLEEP]: saveAppleHealthSleep,
};
const postSyncAppleHealth = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		lastSyncDate: "",
	};
	let mongoSession: ClientSession | null = null;
	try {
		const { usersID } = req;
		const measurements = req.body as IMeasurementsObject;
		const now = new Date();

		logger.info(`postSyncAppleHealth: ${JSON.stringify(measurements)}`);
		logger.info(`activity: ${JSON.stringify(measurements?.activity)}`);
		logger.info(`sleep: ${JSON.stringify(measurements?.sleep)}`);
		if (Object.keys(measurements).some((rawMeasurementCode) => !RAW_MEASUREMENT_CODES_ARRAY.includes(rawMeasurementCode))) {
			responseJSON.error = "Invalid measurement code";
			responseJSON.errorCode = "INVALID_MEASUREMENT_CODE";
			return res.status(400).json(responseJSON);
		}

		if (!usersID) {
			throw new Error("usersID couldn't be found");
		}
		mongoSession = await mongoose.startSession();
		await mongoSession.withTransaction(async () => {
			for (const [measurementCode, measurementsArray] of Object.entries(measurements)) {
				if (measurementsArray && measurementsArray.length > 0 && SYNC_STRATEGY[measurementCode] && mongoSession) {
					const result = await SYNC_STRATEGY[measurementCode](measurementsArray, usersID, mongoSession);
					if (!result) {
						throw new Error(`Error at ${measurementCode}`);
					}
				}
			}
			await Users.updateOne({ _id: new ObjectId(usersID) }, { lastSyncDate: now, lastUpdated: now }, { mongoSession });
		});
		await mongoSession.endSession();

		responseJSON.lastSyncDate = now.toISOString();
		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/appleHealth/postSyncAppleHealth: ${e}`, e);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	} finally {
		if (mongoSession) {
			await mongoSession.endSession();
		}
	}
};

export default postSyncAppleHealth;

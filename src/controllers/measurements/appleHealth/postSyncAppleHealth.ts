import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { HealthValue, MEASUREMENT_CODES } from "@constants/measurements";
import mongoose, { ClientSession } from "mongoose";
import { IActivitySample } from "@controllers/measurements/helpers/saveActivitySamples";
import { ISleepSample } from "@controllers/measurements/helpers/saveSleepSamples";
import saveAppleHealthHeight from "@controllers/measurements/appleHealth/heplers/saveAppleHealthHeight";
import { Measurements } from "@models/measurements";
import saveAppleHealthWeight from "@controllers/measurements/appleHealth/heplers/saveAppleHealthWeight";
import saveAppleHealthWalkingRunningDistance from "@controllers/measurements/appleHealth/heplers/saveAppleHealthWalkingRunningDistance";
import saveAppleHealthSteps from "@controllers/measurements/appleHealth/heplers/saveAppleHealthSteps";
import saveAppleHealthSleep from "@controllers/measurements/appleHealth/heplers/saveAppleHealthSleep";
import saveAppleHealthHeartRate from "@controllers/measurements/appleHealth/heplers/saveAppleHealthHeartRate";
import saveAppleHealthActivity from "@controllers/measurements/appleHealth/heplers/saveAppleHealthActivity";

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
	[MEASUREMENT_CODES.HEART_RATE]: saveAppleHealthHeartRate,
	[MEASUREMENT_CODES.HEIGHT]: saveAppleHealthHeight,
	[MEASUREMENT_CODES.WEIGHT]: saveAppleHealthWeight,
	[MEASUREMENT_CODES.WALKING_RUNNING_DISTANCE]: saveAppleHealthWalkingRunningDistance,
	[MEASUREMENT_CODES.STEPS]: saveAppleHealthSteps,
	[MEASUREMENT_CODES.ACTIVITY]: saveAppleHealthActivity,
	[MEASUREMENT_CODES.SLEEP]: saveAppleHealthSleep,
};
const postSyncAppleHealth = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	let mongoSession: ClientSession | null = null;
	try {
		const { usersID } = req;
		const measurements = req.body as IMeasurementsObject;

		const isAnyMeasurement = Object.values(measurements).some((measurement) => measurement && measurement.length > 0);
		if (!isAnyMeasurement) {
			responseJSON.error = "No measurements found";
			responseJSON.errorCode = "NO_MEASUREMENTS_FOUND";
			return res.status(400).json(responseJSON);
		}

		if (!usersID) {
			throw new Error("usersID couldn't be found");
		}

		const measurementsConfig = await Measurements.find({ active: true }).lean();
		if (!measurementsConfig || !measurementsConfig.length) {
			responseJSON.error = "No config found";
			responseJSON.errorCode = "NO_CONFIG_FOUND";
			return res.status(400).json(responseJSON);
		}

		const preparedMeasurementsConfig = measurementsConfig.reduce(
			(acc, config) => {
				if (!config.code) {
					return acc;
				}
				acc[config.code] = config;
				return acc;
			},
			{} as Record<string, any>
		);

		mongoSession = await mongoose.startSession();
		await mongoSession.withTransaction(async () => {
			for (const [measurementCode, measurementsArray] of Object.entries(measurements)) {
				if (measurementsArray && measurementsArray.length && mongoSession) {
					const result = await SYNC_STRATEGY[measurementCode](
						measurementsArray,
						usersID,
						preparedMeasurementsConfig[measurementCode],
						mongoSession
					);
					if (!result) {
						throw new Error(`Error at ${measurementCode}`);
					}
				}
			}
		});
		// should update last sync date here?
		await mongoSession.endSession();

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

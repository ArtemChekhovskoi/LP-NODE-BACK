import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { HealthValue, RAW_MEASUREMENT_CODES, RAW_MEASUREMENT_CODES_ARRAY } from "@constants/measurements";
import mongoose, { ClientSession, Model, Types } from "mongoose";
import saveAppleHealthHeight from "@controllers/measurements/appleHealth/heplers/saveAppleHealthHeight";
import saveAppleHealthWeight from "@controllers/measurements/appleHealth/heplers/saveAppleHealthWeight";
import saveAppleHealthWalkingRunningDistance from "@controllers/measurements/appleHealth/heplers/saveAppleHealthWalkingRunningDistance";
import saveAppleHealthSteps from "@controllers/measurements/appleHealth/heplers/saveAppleHealthSteps";
import saveAppleHealthSleep, { ISleepSample } from "@controllers/measurements/appleHealth/heplers/saveAppleHealthSleep";
import saveAppleHealthHeartRate from "@controllers/measurements/appleHealth/heplers/saveAppleHealthHeartRate";
import saveAppleHealthActivity, { IActivitySample } from "@controllers/measurements/appleHealth/heplers/saveAppleHealthActivity";
import { Users } from "@models/users";
import { UsersActivity } from "@models/users_activity";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";
import { UsersHeartRate } from "@models/users_heart_rate";
import { UsersDailyHeartRate } from "@models/users_daily_heart_rate";
import { UsersHeight } from "@models/users_height";
import { UsersWeight } from "@models/users_weight";
import { UsersSleep } from "@models/users_sleep";
import { UsersSteps } from "@models/users_steps";
import { UsersWalkingRunningDistance } from "@models/users_walking_running_distance";

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

interface IRequestBody {
	measurements: IMeasurementsObject;
	utcOffset: number;
}

interface IPreparedMeasurementsByCollectionName {
	[key: string]: any[];
}

const PREPARE_STRATEGY = {
	[RAW_MEASUREMENT_CODES.HEART_RATE]: saveAppleHealthHeartRate,
	[RAW_MEASUREMENT_CODES.HEIGHT]: saveAppleHealthHeight,
	[RAW_MEASUREMENT_CODES.WEIGHT]: saveAppleHealthWeight,
	[RAW_MEASUREMENT_CODES.WALKING_RUNNING_DISTANCE]: saveAppleHealthWalkingRunningDistance,
	[RAW_MEASUREMENT_CODES.STEPS]: saveAppleHealthSteps,
	[RAW_MEASUREMENT_CODES.ACTIVITY]: saveAppleHealthActivity,
	[RAW_MEASUREMENT_CODES.SLEEP]: saveAppleHealthSleep,
};

const MODELS_BY_COLLECTION_NAME = {
	[UsersActivity.collection.name]: UsersActivity,
	[UsersDailyMeasurementsSum.collection.name]: UsersDailyMeasurementsSum,
	[UsersHeartRate.collection.name]: UsersHeartRate,
	[UsersDailyHeartRate.collection.name]: UsersDailyHeartRate,
	[UsersHeight.collection.name]: UsersHeight,
	[UsersWeight.collection.name]: UsersWeight,
	[UsersSleep.collection.name]: UsersSleep,
	[UsersSteps.collection.name]: UsersSteps,
	[UsersWalkingRunningDistance.collection.name]: UsersWalkingRunningDistance,
};
const postSyncAppleHealth = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		lastSyncDate: "",
	};
	let mongoSession: ClientSession | null = null;

	const syncStartTime = process.hrtime();
	let transStartTime;
	try {
		const { usersID } = req;
		const { measurements, utcOffset } = req.body as IRequestBody;
		const now = new Date();

		if (Object.keys(measurements).some((rawMeasurementCode) => !RAW_MEASUREMENT_CODES_ARRAY.includes(rawMeasurementCode))) {
			responseJSON.error = "Invalid measurement code";
			responseJSON.errorCode = "INVALID_MEASUREMENT_CODE";
			return res.status(400).json(responseJSON);
		}

		if (!usersID) {
			throw new Error("usersID couldn't be found");
		}

		const preparedMeasurementsByCollectionName: IPreparedMeasurementsByCollectionName = {};

		for (const [measurementCode, measurementsArray] of Object.entries(measurements)) {
			if (measurementsArray && measurementsArray.length > 0 && PREPARE_STRATEGY[measurementCode]) {
				const preparedMeasurementsArray = await PREPARE_STRATEGY[measurementCode](measurementsArray, usersID, utcOffset);
				if (!preparedMeasurementsArray || !preparedMeasurementsArray.length) {
					throw new Error(`Error at ${measurementCode}`);
				}

				for (const preparedMeasurements of preparedMeasurementsArray) {
					if (!preparedMeasurementsByCollectionName[preparedMeasurements.model]) {
						preparedMeasurementsByCollectionName[preparedMeasurements.model] = preparedMeasurements.data;
					} else {
						preparedMeasurementsByCollectionName[preparedMeasurements.model].push(...preparedMeasurements.data);
					}
				}
			}
		}

		transStartTime = process.hrtime();
		mongoSession = await mongoose.startSession();
		await mongoSession.withTransaction(async () => {
			for (const [collectionName, preparedMeasurements] of Object.entries(preparedMeasurementsByCollectionName)) {
				const model = MODELS_BY_COLLECTION_NAME[collectionName] as Model<any>;
				if (!model || !mongoSession) {
					throw new Error(`Model not found for ${collectionName}`);
				}
				await model.bulkWrite(preparedMeasurements, { session: mongoSession });
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
			await mongoSession?.endSession();
		}
		const startDiff = process.hrtime(syncStartTime);
		const transDiff = process.hrtime(transStartTime);
		const overallDuration = startDiff[0] * 1e9 + startDiff[1];
		const transDuration = transDiff[0] * 1e9 + transDiff[1];
		console.log(`Overall sync time: ${overallDuration / 1e6} ms`);
		console.log(`Transaction time: ${transDuration / 1e6} ms`);
	}
};

export default postSyncAppleHealth;

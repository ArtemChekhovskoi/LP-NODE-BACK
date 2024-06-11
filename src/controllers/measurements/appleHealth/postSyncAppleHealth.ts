import validator from "validator";
import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { HealthValue, RAW_MEASUREMENT_CODES, RAW_MEASUREMENT_CODES_ARRAY } from "@constants/measurements";
import saveAppleHealthHeight from "@controllers/measurements/appleHealth/heplers/saveAppleHealthHeight";
import saveAppleHealthWeight from "@controllers/measurements/appleHealth/heplers/saveAppleHealthWeight";
import saveAppleHealthWalkingRunningDistance from "@controllers/measurements/appleHealth/heplers/saveAppleHealthWalkingRunningDistance";
import saveAppleHealthSteps from "@controllers/measurements/appleHealth/heplers/saveAppleHealthSteps";
import saveAppleHealthSleep, { ISleepSample } from "@controllers/measurements/appleHealth/heplers/saveAppleHealthSleep";
import saveAppleHealthHeartRate from "@controllers/measurements/appleHealth/heplers/saveAppleHealthHeartRate";
import saveAppleHealthActivity, { IActivitySample } from "@controllers/measurements/appleHealth/heplers/saveAppleHealthActivity";

import saveSyncData from "@controllers/measurements/appleHealth/heplers/saveSyncData";

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
	endDate: string;
}

export interface IPreparedMeasurementsByCollectionName {
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

const postSyncAppleHealth = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		lastSyncDate: "",
	};
	const syncStartTime = process.hrtime();
	logger.info(`Request size in bytes: ${req.headers["content-length"]}`);
	logger.info(`Body: ${JSON.stringify(req.body)}`);
	try {
		const { usersID } = req;
		const { measurements, utcOffset, endDate } = req.body as IRequestBody;
		const syncEndDatePrepared = new Date(endDate);
		if (
			!measurements ||
			Object.keys(measurements).some((rawMeasurementCode) => !RAW_MEASUREMENT_CODES_ARRAY.includes(rawMeasurementCode))
		) {
			responseJSON.error = "Invalid measurement code";
			responseJSON.errorCode = "INVALID_MEASUREMENT_CODE";
			return res.status(400).json(responseJSON);
		}

		if (!endDate && !validator.isDate(endDate)) {
			responseJSON.error = "Invalid endDate";
			responseJSON.errorCode = "INVALID_END_DATE";
			return res.status(400).json(responseJSON);
		}

		if (!usersID) {
			throw new Error("usersID couldn't be found");
		}

		const preparedMeasurementsByCollectionName: IPreparedMeasurementsByCollectionName = {};
		let totalMeasurementsLength = 0;

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
					totalMeasurementsLength += preparedMeasurements.data.length;
				}
			}
		}

		logger.info(`Total measurements length: ${totalMeasurementsLength}`);
		saveSyncData(preparedMeasurementsByCollectionName, usersID, syncEndDatePrepared, totalMeasurementsLength).catch((e) => {
			logger.error(`Error at saveSyncData: ${e}`, e);
			throw e;
		});
		responseJSON.lastSyncDate = syncEndDatePrepared.toISOString();
		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/appleHealth/postSyncAppleHealth: ${e}`, e);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	} finally {
		const startDiff = process.hrtime(syncStartTime);
		const overallDuration = startDiff[0] * 1e9 + startDiff[1];
		logger.info(`Sync preparation time: ${overallDuration / 1e6} ms`);
	}
};

export default postSyncAppleHealth;

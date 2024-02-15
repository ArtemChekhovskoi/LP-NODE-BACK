import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { Measurements } from "@models/measurements";
import { HealthValue, MEASUREMENT_CODES } from "@constants/measurements";
import saveSimpleAppleValueArray from "@controllers/measurements/helpers/saveSimpleAppleValueArray";
import filterMeasurementsByPeriod from "@controllers/measurements/helpers/filterMeasurementsByPeriod";

interface RequestBody {
	heartRate: HealthValue[];
}

const postUpdateHeartRate = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	try {
		const { usersID } = req;
		const { heartRate } = req.body as RequestBody;

		logger.info(`Start postUpdateHeartRate. Heart rate length: ${heartRate?.length}`);

		if (!heartRate || heartRate.length === 0) {
			responseJSON.error = "Nothing to sync";
			responseJSON.errorCode = "MISSING_DATA";
			return res.status(400).json(responseJSON);
		}

		const measurementsConfig = (await Measurements.findOne(
			{ code: MEASUREMENT_CODES.HEART_RATE },
			{ code: true, unit: true, _id: true }
		)) as IMeasurementsConfig;

		if (!measurementsConfig) {
			responseJSON.error = "No config found";
			responseJSON.errorCode = "NO_CONFIG_FOUND";
			return res.status(400).json(responseJSON);
		}

		const filteredHeartRate = filterMeasurementsByPeriod(heartRate);

		await saveSimpleAppleValueArray(filteredHeartRate, measurementsConfig, usersID!);

		logger.info(`End postUpdateHeartRate`);
		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/appleHealth/postUpdateHeartRate: ${e}`, e);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default postUpdateHeartRate;

import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { Measurements } from "@models/measurements";
import { HealthValue, MEASUREMENT_CODES } from "@constants/measurements";
import saveSimpleAppleValueArray from "@controllers/measurements/helpers/saveSimpleAppleValueArray";

interface RequestBody {
	weight: HealthValue[];
}
const postUpdateWeight = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	try {
		const { usersID } = req;
		const { weight } = req.body as RequestBody;
		logger.info(`Start postUpdateWeight. Weight length: ${weight?.length}`);

		if (!weight || weight.length === 0) {
			responseJSON.error = "Nothing to sync";
			responseJSON.errorCode = "MISSING_DATA";
			return res.status(400).json(responseJSON);
		}

		const measurementsConfig = (await Measurements.findOne(
			{ code: MEASUREMENT_CODES.WEIGHT },
			{ code: true, unit: true, _id: true }
		)) as IMeasurementsConfig;

		if (!measurementsConfig) {
			responseJSON.error = "No config found";
			responseJSON.errorCode = "NO_CONFIG_FOUND";
			return res.status(400).json(responseJSON);
		}

		await saveSimpleAppleValueArray(weight, measurementsConfig, usersID!);

		logger.info(`End postUpdateWeight`);
		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/appleHealth/postUpdateWeight: ${e}`, e);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default postUpdateWeight;

import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { Measurements } from "@models/measurements";
import { MEASUREMENT_CODES } from "@constants/measurements";
import { ISleepSample, saveSleepSamples } from "@controllers/measurements/helpers/saveSleepSamples";

interface RequestBody {
	sleep: ISleepSample[];
}

const postUpdateSleep = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	try {
		const { usersID } = req;
		const { sleep } = req.body as RequestBody;

		logger.info(`Start postUpdateSleep. Sleep length: ${sleep?.length}. Example: ${JSON.stringify(sleep[0])}`);

		if (!sleep || sleep.length === 0) {
			responseJSON.error = "Nothing to sync";
			responseJSON.errorCode = "MISSING_DATA";
			return res.status(400).json(responseJSON);
		}

		const measurementsConfig = (await Measurements.findOne(
			{ code: MEASUREMENT_CODES.SLEEP },
			{ code: true, unit: true, precision: true, _id: true }
		)) as IMeasurementsConfig;

		if (!measurementsConfig) {
			responseJSON.error = "No config found";
			responseJSON.errorCode = "NO_CONFIG_FOUND";
			return res.status(400).json(responseJSON);
		}

		await saveSleepSamples(sleep, usersID!, measurementsConfig);
		logger.info(`End postUpdateSleep`);

		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/appleHealth/postUpdateSleep: ${e}`, e);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default postUpdateSleep;

import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";
import { Measurements } from "@models/measurements";
import { MEASUREMENT_CODES } from "@constants/measurements";
import { IActivitySample, saveActivitySamples } from "@controllers/measurements/helpers/saveActivitySamples";

interface RequestBody {
	activity: IActivitySample[];
}
const postUpdateActivity = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	try {
		const { usersID } = req;
		const { activity } = req.body as RequestBody;
		logger.info(`Start postUpdateActivity. Activity length: ${activity?.length}. Example: ${JSON.stringify(activity[0])}`);

		if (!activity || activity.length === 0) {
			responseJSON.error = "Nothing to sync";
			responseJSON.errorCode = "MISSING_DATA";
			return res.status(400).json(responseJSON);
		}

		const measurementsConfig = (await Measurements.findOne(
			{ code: MEASUREMENT_CODES.ACTIVITY },
			{ code: true, unit: true, _id: true }
		)) as IMeasurementsConfig;

		if (!measurementsConfig) {
			responseJSON.error = "No config found";
			responseJSON.errorCode = "NO_CONFIG_FOUND";
			return res.status(400).json(responseJSON);
		}

		await saveActivitySamples(activity, usersID!);
		logger.info(`End postUpdateActivity`);

		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/appleHealth/postUpdateActivitySample: ${e}`, e);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default postUpdateActivity;

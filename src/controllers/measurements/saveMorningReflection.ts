import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import getStartOfDay from "@helpers/getStartOfTheDay";
import mongoose, { ClientSession } from "mongoose";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import { MEASUREMENT_CODES } from "@constants/measurements";
import { UsersDailyReflections } from "@models/users_daily_reflections";

const postSaveMorningReflection = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	let mongoSession: ClientSession | null = null;
	try {
		const { sleepQuality } = req.body;
		const { usersID } = req;

		const startOfTheDay = getStartOfDay(new Date());

		mongoSession = await mongoose.startSession();
		await mongoSession.withTransaction(async () => {
			await UsersDailyMeasurements.updateOne(
				{ usersID, date: startOfTheDay, measurementCode: MEASUREMENT_CODES.SLEEP_QUALITY },
				{
					value: sleepQuality,
					lastUpdated: new Date(),
				},
				{ session: mongoSession, upsert: true }
			);
			await UsersDailyReflections.updateOne(
				{ usersID, date: startOfTheDay },
				{ isMorningReflectionDone: true },
				{ session: mongoSession, upsert: true }
			);
		});
		await mongoSession.endSession();

		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/postSaveMorningReflection: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	} finally {
		if (mongoSession) {
			await mongoSession.endSession();
		}
	}
};

export default postSaveMorningReflection;

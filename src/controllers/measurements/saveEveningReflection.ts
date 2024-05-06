import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import getStartOfDay from "@helpers/getStartOfTheDay";
import mongoose, { ClientSession, Types } from "mongoose";
import { UsersDailyReflections } from "@models/users_daily_reflections";

const { ObjectId } = Types;

const postSaveEveningReflection = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	let mongoSession: ClientSession | null = null;
	try {
		const { emotionsID, notes, activityFeeling } = req.body;
		const { usersID } = req;

		const startOfTheDay = getStartOfDay(new Date());
		mongoSession = await mongoose.startSession();
		await mongoSession.withTransaction(async () => {
			if (!emotionsID && !activityFeeling && !!notes) {
				await UsersDailyReflections.updateOne(
					{ usersID: new ObjectId(usersID), date: startOfTheDay },
					{ notes, isEveningReflectionDone: false },
					{ session: mongoSession, upsert: true }
				);
				return;
			}
			await UsersDailyReflections.updateOne(
				{ usersID: new ObjectId(usersID), date: startOfTheDay },
				{ isEveningReflectionDone: true, notes, activityFeeling, emotionsID },
				{ session: mongoSession, upsert: true }
			);
		});
		await mongoSession.endSession();

		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/postSaveEveningReflection: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	} finally {
		if (mongoSession) {
			await mongoSession.endSession();
		}
	}
};

export default postSaveEveningReflection;

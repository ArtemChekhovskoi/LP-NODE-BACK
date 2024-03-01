import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersDailyNotes } from "@models/users_daily_notes";
import mongoose, { ClientSession, Types } from "mongoose";
import { UsersDailyEmotions } from "@models/users_daily_emotions";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import { MEASUREMENT_CODES } from "@constants/measurements";
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
			if (emotionsID) {
				await UsersDailyEmotions.updateOne(
					{
						usersID: new ObjectId(usersID),
						date: startOfTheDay,
					},
					{
						emotionsID: new ObjectId(emotionsID),
						lastUpdated: new Date(),
					},
					{
						session: mongoSession,
						upsert: true,
					}
				);
			}
			if (notes) {
				await UsersDailyNotes.updateOne(
					{
						usersID: new ObjectId(usersID),
						date: startOfTheDay,
					},
					{
						notes,
						lastUpdated: new Date(),
					},
					{
						session: mongoSession,
						upsert: true,
					}
				);
			}
			if (activityFeeling) {
				await UsersDailyMeasurements.updateOne(
					{
						usersID: new ObjectId(usersID),
						date: startOfTheDay,
						measurementCode: MEASUREMENT_CODES.ACTIVITY_FEELING,
					},
					{
						value: activityFeeling,
						lastUpdated: new Date(),
					},
					{
						session: mongoSession,
						upsert: true,
					}
				);
			}
			await UsersDailyReflections.updateOne(
				{ usersID: new ObjectId(usersID), date: startOfTheDay },
				{ isEveningReflectionDone: true },
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

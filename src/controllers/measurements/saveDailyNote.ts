import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import getStartOfDay from "@helpers/getStartOfTheDay";
import mongoose, { ClientSession, Types } from "mongoose";
import { UsersNotes } from "@models/users_notes";

const { ObjectId } = Types;

const postSaveDailyNote = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	let mongoSession: ClientSession | null = null;
	try {
		const { note } = req.body;
		const { usersID } = req;

		if (!note) {
			responseJSON.error = "Note is required";
			responseJSON.errorCode = "NOTE_REQUIRED";
			return res.status(400).json(responseJSON);
		}

		const startOfTheDay = getStartOfDay(new Date());
		mongoSession = await mongoose.startSession();
		await mongoSession.withTransaction(async () => {
			await UsersNotes.updateOne(
				{
					usersID: new ObjectId(usersID),
					date: startOfTheDay,
				},
				{
					note,
					lastUpdated: new Date(),
				},
				{
					session: mongoSession,
					upsert: true,
				}
			);
		});
		await mongoSession.endSession();

		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/postSaveDailyNote: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	} finally {
		if (mongoSession) {
			await mongoSession.endSession();
		}
	}
};

export default postSaveDailyNote;

import { logger } from "@logger/index";
import { Types } from "mongoose";
import { Response } from "express";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { UsersOpenaiPatterns } from "@models/users_openai_patterns";
import validator from "validator";

const { ObjectId } = Types;

const postRatePatterns = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	try {
		const { isRelevantToUser, usersOpenaiPatternID } = req.body;

		if (typeof isRelevantToUser !== "boolean") {
			responseJSON.error = "isRelevantToUser is required and should be boolean";
			responseJSON.errorCode = "INCORRECT_PARAMETER";
			return res.status(400).json(responseJSON);
		}

		if (!usersOpenaiPatternID || typeof usersOpenaiPatternID !== "string" || !validator.isMongoId(usersOpenaiPatternID)) {
			responseJSON.error = "usersOpenaiPatternID is required and should be valid";
			responseJSON.errorCode = "INCORRECT_PARAMETER";
			return res.status(400).json(responseJSON);
		}

		await UsersOpenaiPatterns.updateOne({ _id: new ObjectId(usersOpenaiPatternID) }, { isRelevantToUser });

		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error in controllers/postRatePatterns: ${e}`);
		logger.error(e);
		responseJSON.error = "Internal server error";
		responseJSON.errorCode = "INTERNAL_SERVER_ERROR";
		return res.status(500).json(responseJSON);
	}
};

export default postRatePatterns;

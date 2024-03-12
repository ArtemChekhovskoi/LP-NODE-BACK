import { Response } from "express";
import { logger } from "@logger/index";
import { Types } from "mongoose";

import { ExtendedRequest } from "@middlewares/checkAuth";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { Users } from "@models/users";
import { UsersDailyReflections } from "@models/users_daily_reflections";

const { ObjectId } = Types;

const getProfile = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		data: {},
	};
	try {
		const { usersID } = req;

		const date = getStartOfDay(new Date());
		const [userProfile, usersReflection] = await Promise.all([
			Users.findOne(
				{ _id: usersID },
				{
					name: true,
					email: true,
					gender: true,
					registrationStep: true,
					appsConnected: true,
					lastSyncDate: true,
				}
			).lean(),
			UsersDailyReflections.findOne(
				{ usersID: new ObjectId(usersID), date },
				{
					isMorningReflectionDone: true,
					isEveningReflectionDone: true,
				}
			).lean(),
		]);

		if (!userProfile) {
			responseJSON.error = "Missing user!";
			responseJSON.errorCode = "MISSING_USER";
			return res.status(400).json(responseJSON);
		}

		responseJSON.data = {
			...userProfile,
			isMorningReflectionDone: usersReflection?.isMorningReflectionDone || false,
			isEveningReflectionDone: usersReflection?.isEveningReflectionDone || false,
		};
		responseJSON.success = true;
		return res.json(responseJSON);
	} catch (e) {
		logger.error(`Error at getProfile: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default getProfile;

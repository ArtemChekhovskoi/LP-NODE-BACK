import { Request, Response } from "express";
import { isValidToken } from "@controllers/user/helpers/isValidToken";
import { getDataFromGoogle } from "@controllers/user/helpers/getDataFromGoogle";
import { logger } from "@logger/index";
import mongoose, { ClientSession } from "mongoose";
import { socialLogin } from "./helpers/socialLogin";

export type SocialType = "google" | "facebook" | "apple";
export interface IGoogleProfile {
	id: string;
	email: string;
	name: string;
	verified_email: boolean;
	given_name: string;
	family_name: string;
	picture: string;
	locale: string;
	userAgent?: string;
}

export interface IClientData {
	userAgent?: string;
}

interface IUserData {
	accessToken: string;
	usersID: string;
	registrationStep?: string;
	appsConnected: string[] | [];
	lastSyncDate: Date;
}

interface ApiResponse {
	success: boolean;
	data: IUserData | null;
	error: string;
	errorCode: string;
}
const postGoogleSignIn = async (req: Request, res: Response) => {
	const responseJSON: ApiResponse = {
		success: false,
		data: null,
		error: "",
		errorCode: "",
	};
	let mongoSession: ClientSession | null = null;
	let userData: IUserData | null = null;

	try {
		const { token, localTimeOffset } = req.body;
		// token validation
		const isValidGoogleToken = isValidToken(token);
		if (!isValidGoogleToken) {
			logger.error(`Error at controllers/postGoogleSign: Invalid token 1!`);
			responseJSON.error = "Invalid token!";
			responseJSON.errorCode = "INVALID_TOKEN";
			return res.status(400).json(responseJSON);
		}

		if (!localTimeOffset) {
			logger.error(`Error at controllers/postGoogleSign: Invalid localTime!`);
			responseJSON.error = "Invalid localTime!";
			responseJSON.errorCode = "INVALID_LOCAL_TIME";
			return res.status(400).json(responseJSON);
		}

		const profile = await getDataFromGoogle(token);

		if (!profile || !profile.id) {
			logger.error(`Error at controllers/postGoogleSign: Invalid token 2!`);
			responseJSON.error = "Invalid token!";
			responseJSON.errorCode = "INVALID_TOKEN";
			return res.status(400).json(responseJSON);
		}

		mongoSession = await mongoose.startSession();
		await mongoSession.withTransaction(async () => {
			userData = (await socialLogin(req, res, profile, "google", mongoSession)) as IUserData;
			responseJSON.success = true;
			responseJSON.data = userData;
		});
		await mongoSession.endSession();

		return res.status(200).json(responseJSON);
	} catch (error) {
		logger.error(`Error at controllers/postGoogleSign: ${error}`, error);
		responseJSON.error = "Internal server error";
		responseJSON.errorCode = "INTERNAL_SERVER_ERROR";
		return res.status(500).json(responseJSON);
	} finally {
		if (mongoSession) {
			await mongoSession.endSession();
		}
	}
};

export default postGoogleSignIn;

import { Request, Response } from "express";
import { isValidToken } from "@controllers/user/helpers/isValidToken";
import { getDataFromGoogle } from "@controllers/user/helpers/getDataFromGoogle";
import { logger } from "@logger/index";
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

interface ApiResponse {
	success: boolean;
	data: {
		token?: string;
		registrationStep?: string;
		usersID?: string;
		provider?: SocialType;
	};
	error: string;
	errorCode: string;
}
const postGoogleSignIn = async (req: Request, res: Response) => {
	const PROVIDER = "google";
	const responseJSON: ApiResponse = {
		success: false,
		data: {},
		error: "",
		errorCode: "",
	};
	try {
		const { token } = req.body;
		// token validation
		const isValidGoogleToken = isValidToken(token);
		if (!isValidGoogleToken) {
			logger.error(`Error at controllers/postGoogleSign: Invalid token 1!`);
			responseJSON.error = "Invalid token!";
			responseJSON.errorCode = "INVALID_TOKEN";
			return res.status(400).json(responseJSON);
		}

		const profile = await getDataFromGoogle(token);

		if (!profile || !profile.id) {
			logger.error(`Error at controllers/postGoogleSign: Invalid token 2!`);
			responseJSON.error = "Invalid token!";
			responseJSON.errorCode = "INVALID_TOKEN";
			return res.status(400).json(responseJSON);
		}

		const userData = await socialLogin(req, res, profile, "google");

		responseJSON.success = true;
		responseJSON.data = userData;
		responseJSON.data.provider = PROVIDER;
		return res.status(200).json(responseJSON);
	} catch (error) {
		logger.error(`Error at controllers/postGoogleSign: ${error}`, error);
		responseJSON.error = "Internal server error";
		responseJSON.errorCode = "INTERNAL_SERVER_ERROR";
		return res.status(500).json(responseJSON);
	}
};

export default postGoogleSignIn;

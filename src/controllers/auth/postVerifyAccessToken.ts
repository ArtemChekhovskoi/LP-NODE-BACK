import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";

const postVerifyAccessToken = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		data: {
			user_id: "",
		},
	};
	try {
		const { usersID } = req;

		if (!usersID) {
			responseJSON.error = "Invalid access token";
			responseJSON.errorCode = "INVALID ACCESS TOKEN";
			return res.status(400).json(responseJSON);
		}
		responseJSON.success = true;
		responseJSON.data.user_id = usersID;
		return res.json(responseJSON);
	} catch (e) {
		logger.error(`Error at postLogOut: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default postVerifyAccessToken;

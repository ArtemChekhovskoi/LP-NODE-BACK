import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { Users } from "@models/users";

const postSavePushToken = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	try {
		const { pushToken, isPermissionGranted } = req.body;
		const { usersID } = req;

		if (!pushToken && isPermissionGranted) {
			responseJSON.error = "Missing pushToken!";
			responseJSON.errorCode = "MISSING_PUSH_TOKEN";
			return res.status(400).json(responseJSON);
		}

		if (pushToken && !isPermissionGranted) {
			responseJSON.error = "Token is provided but permission is not granted!";
			responseJSON.errorCode = "MISSING_PERMISSION";
			return res.status(400).json(responseJSON);
		}

		if (pushToken && typeof pushToken !== "string") {
			responseJSON.error = "Invalid pushToken!";
			responseJSON.errorCode = "INVALID_PUSH_TOKEN";
			return res.status(400).json(responseJSON);
		}

		const pushTokenPrepared = isPermissionGranted && pushToken ? pushToken : null;
		await Users.updateOne({ _id: usersID }, { pushNotifications: { isPermissionGranted, pushToken: pushTokenPrepared } });

		responseJSON.success = true;
		return res.json(responseJSON);
	} catch (e) {
		logger.error(`Error at postSavePushToken: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default postSavePushToken;

import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { PushNotifications } from "@models/push_notifications";
import { IResponseWithData } from "@controllers/controllers.interface";
import { Types } from "mongoose";

interface IResponseData {
	_id: Types.ObjectId;
	displayName: string;
}
const getPushNotificationsConfig = async (req: ExtendedRequest, res: Response) => {
	const responseJSON: IResponseWithData<IResponseData[] | []> = {
		success: false,
		error: "",
		errorCode: "",
		data: [],
	};
	try {
		const pushNotifications = await PushNotifications.find({ active: true }, { _id: true, displayName: true }).lean();

		if (!pushNotifications?.length) {
			responseJSON.error = "No push notifications found";
			responseJSON.errorCode = "NO_PUSH_NOTIFICATIONS_FOUND";
			return res.status(400).json(responseJSON);
		}

		responseJSON.data = pushNotifications || [];
		responseJSON.success = true;
		return res.json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/main/getPushNotificationsConfig: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default getPushNotificationsConfig;

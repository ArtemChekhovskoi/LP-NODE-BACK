import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { Users } from "@models/users";
import { PushNotifications } from "@models/push_notifications";

const postUpdatePushSubscriptions = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		data: [],
	};
	try {
		const { pushSubscriptions } = req.body;
		const { usersID } = req;

		if (!pushSubscriptions || !Array.isArray(pushSubscriptions) || !pushSubscriptions.every((push) => typeof push === "string")) {
			responseJSON.error = `pushSubscriptions be an array of strings`;
			responseJSON.errorCode = "INVALID_PARAMETER";
			return res.status(400).json(responseJSON);
		}

		const pushNotificationsConfigs = await PushNotifications.find({ active: true }, { _id: true }).lean();
		if (!pushNotificationsConfigs?.length) {
			responseJSON.error = "Missing push notifications configs!";
			responseJSON.errorCode = "MISSING_PUSH_NOTIFICATIONS_CONFIGS";
			return res.status(400).json(responseJSON);
		}

		const isPushSubscriptionsValid = pushSubscriptions.every((pushID) => {
			return pushNotificationsConfigs.some((config) => config._id.toString() === pushID);
		});

		if (!isPushSubscriptionsValid) {
			responseJSON.error = `Invalid pushSubscriptions IDs`;
			responseJSON.errorCode = "INVALID_PARAMETER";
			return res.status(400).json(responseJSON);
		}

		await Users.updateOne(
			{ _id: usersID },
			{
				$set: {
					"pushNotifications.pushSubscriptions": pushSubscriptions,
				},
			}
		);

		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/user/postUpdatePushSubscriptions: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default postUpdatePushSubscriptions;

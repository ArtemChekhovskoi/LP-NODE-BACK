import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { ACTION_FIELDS, NOTIFICATION_ACTION_TYPES_ARRAY } from "@constants/notifications";
import { UsersNotifications } from "@models/users_notifications";
import { Types } from "mongoose";

const { ObjectId } = Types;
const postUpdateNotificationStatus = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	try {
		const { usersNotificationID, action } = req.body;

		if (!action || !NOTIFICATION_ACTION_TYPES_ARRAY.includes(action)) {
			responseJSON.error = "Invalid action";
			responseJSON.errorCode = "INVALID_ACTION";
			return res.status(400).json(responseJSON);
		}

		const usersNotification = await UsersNotifications.findOne(
			{
				_id: new ObjectId(usersNotificationID),
			},
			{ _id: true }
		);

		if (!usersNotification) {
			responseJSON.error = "Notification not found";
			responseJSON.errorCode = "NOTIFICATION_NOT_FOUND";
			return res.status(400).json(responseJSON);
		}

		await UsersNotifications.updateOne(
			{ _id: new ObjectId(usersNotificationID) },
			{
				$set: {
					...ACTION_FIELDS[action],
					lastUpdated: new Date(),
				},
			}
		);

		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/postUpdateDailyNotes: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default postUpdateNotificationStatus;

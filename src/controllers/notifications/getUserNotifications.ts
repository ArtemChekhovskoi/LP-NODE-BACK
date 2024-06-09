import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { UsersNotifications } from "@models/users_notifications";
import { Types } from "mongoose";

const { ObjectId } = Types;

const getUserNotifications = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		data: {},
	};
	try {
		const { usersID } = req;

		const notificationsPipeline = [
			{
				$match: {
					usersID: new ObjectId(usersID),
					isClosed: false,
					isClicked: false,
				},
			},
			{
				$lookup: {
					from: "notifications",
					localField: "notificationsID",
					foreignField: "_id",
					as: "notification",
					pipeline: [
						{
							$match: {
								active: true,
							},
						},
					],
				},
			},
			{
				$unwind: "$notification",
			},
			{
				$project: {
					_id: false,
					usersNotificationID: "$_id",
					screen: "$notification.screen",
					slot: "$notification.slot",
					type: "$notification.type",
					title: "$notification.title",
					text: "$notification.text",
					displayType: "$notification.displayType",
					isButtonExists: "$notification.isButtonExists",
					buttonText: "$notification.buttonText",
					isClickable: "$notification.isClickable",
					buttonLink: "$notification.buttonLink",
				},
			},
		];

		const activeNotifications = await UsersNotifications.aggregate(notificationsPipeline);

		responseJSON.data = activeNotifications;
		responseJSON.success = true;
		return res.json(responseJSON);
	} catch (e) {
		logger.error(`Error at getProfile: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default getUserNotifications;

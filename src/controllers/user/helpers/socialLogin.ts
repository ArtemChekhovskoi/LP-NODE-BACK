import { Users } from "@models/users";
import { Request, Response } from "express";
import { IGoogleProfile, SocialType } from "@controllers/user/postGoogleSignin";
import createSha512Hash from "@helpers/createSha512Hash";
import dayjs from "dayjs";
import { Notifications } from "@models/notifications";
import { NOTIFICATIONS_TYPES } from "@constants/notifications";
import { UsersNotifications } from "@models/users_notifications";
import { ClientSession } from "mongoose";
import { generateAuthToken } from "./generateAuthToken";

interface ISocialLoginReturn {
	accessToken: string;
	usersID: string;
	registrationStep?: string;
	appsConnected: string[] | [];
	lastSyncDate: Date;
}
const socialLogin = async (
	req: Request,
	res: Response,
	profile: IGoogleProfile,
	socialFieldName: SocialType,
	mongoSession: ClientSession | null
): Promise<ISocialLoginReturn> => {
	const clientData = { userAgent: req.headers["user-agent"] };
	const hashedProfileId = createSha512Hash(`${profile.id}`) || "";

	const searchOption = {
		socialAccounts: { [socialFieldName]: hashedProfileId },
		active: true,
	};
	const userBySocialId = await Users.findOne(searchOption);
	if (userBySocialId) {
		const tokens = await generateAuthToken(socialFieldName, clientData, userBySocialId._id);
		return {
			...tokens,
			usersID: userBySocialId._id.toString(),
			registrationStep: userBySocialId.registrationStep,
			appsConnected: userBySocialId.appsConnected,
			lastSyncDate: userBySocialId.lastSyncDate || new Date(),
		};
	}

	// Create new user
	const newUser = new Users({
		socialAccounts: {
			[socialFieldName]: hashedProfileId,
		},
		created: new Date(),
		lastUpdated: new Date(),
		active: true,
		registrationStep: "gender",
		lastSyncDate: dayjs().subtract(1, "month").toDate(),
	});
	const uploadDataNotification = await Notifications.findOne(
		{ type: NOTIFICATIONS_TYPES.ONBOARDING_UPLOAD_DATA, active: true },
		{ _id: true }
	);
	if (!uploadDataNotification) {
		throw new Error("User onboarding notification not found");
	}

	const newUserUploadDataNotification = new UsersNotifications({
		usersID: newUser._id,
		notificationsID: uploadDataNotification?._id,
		isClosed: false,
		isClicked: false,
	});
	const savedNewUser = await newUser.save({ session: mongoSession });
	await newUserUploadDataNotification.save({ session: mongoSession });

	const tokens = await generateAuthToken(socialFieldName, clientData, newUser._id);

	return {
		...tokens,
		usersID: savedNewUser._id.toString(),
		registrationStep: savedNewUser.registrationStep,
		lastSyncDate: savedNewUser.lastSyncDate || new Date(),
		appsConnected: [],
	};
};

export { socialLogin };

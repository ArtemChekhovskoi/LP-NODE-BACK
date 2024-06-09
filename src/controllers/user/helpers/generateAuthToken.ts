import jwt from "jsonwebtoken";
import { Sessions } from "@models/sessions";
import config from "@config/index";
import { IClientData, SocialType } from "@controllers/user/postGoogleSignin";
import { Types } from "mongoose";

interface IGenerateAuthTokenReturn {
	accessToken: string;
}
const generateAuthToken = async (type: SocialType, clientData: IClientData, usersID: Types.ObjectId): Promise<IGenerateAuthTokenReturn> => {
	const { userAgent } = clientData;
	const { accessTokenSecret, accessTokenExpires, maxCount } = config.jwt;

	const userTokensCount = await Sessions.countDocuments({
		usersID,
		active: true,
	});

	const newSession = new Sessions({
		usersID,
		type,
		userAgent,
		created: new Date(),
		active: true,
	});

	const tokenData = { sessionID: newSession._id.toString() };

	const accessToken = jwt.sign(tokenData, accessTokenSecret, {
		expiresIn: accessTokenExpires,
	});

	newSession.accessTokenTTL = accessTokenExpires;

	await newSession.save();

	if (userTokensCount >= maxCount) {
		const skipTokens = maxCount;
		const sessionsToDisable = await Sessions.find({
			usersID,
			active: true,
		})
			.sort({ created: -1 })
			.skip(skipTokens);
		const sessionsToDisableIds = sessionsToDisable.map((sessionObject) => sessionObject._id);
		await Sessions.updateMany({ _id: { $in: sessionsToDisableIds } }, { $set: { active: false } });
	}

	return { accessToken };
};

export { generateAuthToken };

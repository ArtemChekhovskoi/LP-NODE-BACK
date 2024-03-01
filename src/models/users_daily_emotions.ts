import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";
import { EmotionsConfig } from "@models/emotions_config";

const usersDailyEmotions = new Schema({
	usersID: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: Users.collection.name,
	},
	date: {
		type: Date,
		required: true,
	},
	emotionsID: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: EmotionsConfig.collection.name,
	},
	lastUpdated: {
		type: Date,
		required: true,
	},
});

const UsersDailyEmotions = mongoose.model("users_daily_emotions", usersDailyEmotions);
export type TUsersDailyEmotions = InferSchemaType<typeof usersDailyEmotions>;
export { UsersDailyEmotions };

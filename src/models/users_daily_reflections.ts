import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersDailyReflections = new Schema(
	{
		usersID: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: Users.collection.name,
		},
		date: {
			type: Date,
			required: true,
		},
		isEveningReflectionDone: {
			type: Boolean,
			required: true,
			default: false,
		},
		isMorningReflectionDone: {
			type: Boolean,
			required: true,
			default: false,
		},
		activityFeeling: {
			type: Number,
			required: false,
		},
		sleepQuality: {
			type: Number,
			required: false,
		},
		notes: {
			type: String,
			required: false,
		},
		emotionsID: {
			type: Schema.Types.ObjectId,
			required: false,
			ref: "emotions_config",
		},
		lastUpdated: {
			type: Date,
			required: true,
			default: new Date(),
		},
	},
	{ collection: "users_daily_reflections" }
);

const UsersDailyReflections = mongoose.model("users_daily_reflections", usersDailyReflections);
export type TUsersDailyReflections = InferSchemaType<typeof usersDailyReflections>;
export { UsersDailyReflections };

import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersDailySleep = new Schema(
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
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		value: {
			type: String,
			required: true,
		},
		sourceName: {
			type: String,
			required: true,
		},
		lastUpdated: {
			type: Date,
			required: true,
			default: new Date(),
		},
	},
	{ collection: "users_daily_sleep" }
);

const UsersDailySleep = mongoose.model("users_daily_sleep", usersDailySleep);
export type TUsersDailySleep = InferSchemaType<typeof usersDailySleep>;
export { UsersDailySleep };

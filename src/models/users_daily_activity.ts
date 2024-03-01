import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersDailyActivity = new Schema(
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
		activeEnergyBurned: {
			type: Number,
			required: true,
		},
		exerciseTimeMinutes: {
			type: Number,
			required: true,
		},
		lastUpdated: {
			type: Date,
			required: true,
			default: new Date(),
		},
	},
	{ collection: "users_daily_activity" }
);

const UsersDailyActivity = mongoose.model("users_daily_activity", usersDailyActivity);
export type TUsersDailyActivity = InferSchemaType<typeof usersDailyActivity>;
export { UsersDailyActivity };

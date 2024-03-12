import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersDailyHeartRate = new Schema(
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
		heartRate: {
			min: {
				type: Number,
				required: true,
			},
			max: {
				type: Number,
				required: true,
			},
			avg: {
				type: Number,
				required: true,
			},
		},
		recordsScanned: {
			type: Number,
			required: true,
		},
		lastUpdated: {
			type: Date,
			required: true,
			default: new Date(),
		},
		created: {
			type: Date,
			required: true,
			default: new Date(),
		},
	},
	{ collection: "users_daily_heart_rate" }
);

const UsersDailyHeartRate = mongoose.model("users_daily_heart_rate", usersDailyHeartRate);
export type TUsersDailyHeartRate = InferSchemaType<typeof usersDailyHeartRate>;
export { UsersDailyHeartRate };

import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersHeartRate = new Schema(
	{
		usersID: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: Users.collection.name,
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
			type: Number,
			required: true,
		},
		minValue: {
			type: Number,
			required: true,
		},
		maxValue: {
			type: Number,
			required: true,
		},
		sourceName: {
			type: String,
			required: true,
		},
	},
	{ collection: "users_heart_rate" }
);

const UsersHeartRate = mongoose.model("users_heart_rate", usersHeartRate);
export type TUsersHeartRate = InferSchemaType<typeof usersHeartRate>;
export { UsersHeartRate };

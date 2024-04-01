import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersActivity = new Schema(
	{
		usersID: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: Users.collection.name,
		},
		activeEnergyBurned: {
			type: Number,
			required: true,
		},
		activityType: {
			type: Number,
			required: true,
		},
		durationS: {
			type: Number,
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
		lastUpdated: {
			type: Date,
			required: true,
			default: new Date(),
		},
	},
	{ collection: "users_activity" }
);

const UsersActivity = mongoose.model("users_activity", usersActivity);
export type TUsersActivity = InferSchemaType<typeof usersActivity>;
export { UsersActivity };

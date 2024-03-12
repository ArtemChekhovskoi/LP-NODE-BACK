import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersWalkingRunningDistance = new Schema(
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
		sourceName: {
			type: String,
		},
		lastUpdated: {
			type: Date,
			required: true,
			default: new Date(),
		},
	},
	{ collection: "users_walking_running_distance" }
);

const UsersWalkingRunningDistance = mongoose.model("users_walking_running_distance", usersWalkingRunningDistance);
export type TUsersWalkingRunningDistance = InferSchemaType<typeof usersWalkingRunningDistance>;
export { UsersWalkingRunningDistance };

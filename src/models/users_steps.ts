import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersSteps = new Schema(
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
	{ collection: "users_steps" }
);

const UsersSteps = mongoose.model("users_steps", usersSteps);
export type TUsersSteps = InferSchemaType<typeof usersSteps>;
export { UsersSteps };

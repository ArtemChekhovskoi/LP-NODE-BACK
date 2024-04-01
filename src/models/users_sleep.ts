import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersSleep = new Schema(
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
			required: true,
		},
		lastUpdated: {
			type: Date,
			required: true,
			default: new Date(),
		},
	},
	{ collection: "users_sleep" }
);

const UsersSleep = mongoose.model("users_sleep", usersSleep);
export type TUsersSleep = InferSchemaType<typeof usersSleep>;
export { UsersSleep };

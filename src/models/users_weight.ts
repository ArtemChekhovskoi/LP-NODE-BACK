import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersWeight = new Schema(
	{
		usersID: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: Users.collection.name,
		},
		date: {
			type: Date,
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
	{ collection: "users_weight" }
);

const UsersWeight = mongoose.model("users_weight", usersWeight);
export type TUsersWeight = InferSchemaType<typeof usersWeight>;
export { UsersWeight };

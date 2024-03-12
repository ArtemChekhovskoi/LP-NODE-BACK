import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersHeight = new Schema(
	{
		usersID: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: Users.collection.name,
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
	{ collection: "users_height" }
);

const UsersHeight = mongoose.model("users_height", usersHeight);
export type TUsersHeight = InferSchemaType<typeof usersHeight>;
export { UsersHeight };

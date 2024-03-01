import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersDailyNotes = new Schema({
	usersID: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: Users.collection.name,
	},
	date: {
		type: Date,
		required: true,
	},
	notes: {
		type: String,
		required: true,
	},
	lastUpdated: {
		type: Date,
		required: true,
	},
});

const UsersDailyNotes = mongoose.model("users_daily_notes", usersDailyNotes);
export type TUsersDailyNotes = InferSchemaType<typeof usersDailyNotes>;
export { UsersDailyNotes };

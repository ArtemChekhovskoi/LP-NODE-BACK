import mongoose, { InferSchemaType, Schema } from "mongoose";

const usersNotes = new Schema(
	{
		usersID: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		note: {
			type: String,
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
		created: {
			type: Date,
			required: true,
			default: Date.now,
		},
		lastUpdated: {
			type: Date,
			required: true,
			default: Date.now,
		},
	},
	{ collection: "users_notes" }
);

const UsersNotes = mongoose.model("UsersNotes", usersNotes);
export type TUsersNotes = InferSchemaType<typeof usersNotes>;
export { UsersNotes };

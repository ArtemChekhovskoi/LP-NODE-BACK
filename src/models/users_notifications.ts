import mongoose, { InferSchemaType, Schema } from "mongoose";

const usersNotifications = new Schema(
	{
		usersID: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		notificationsID: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		isClosed: {
			type: Boolean,
			required: true,
		},
		isClicked: {
			type: Boolean,
			required: true,
		},
		created: {
			type: Date,
			required: true,
		},
		lastUpdated: {
			type: Date,
			required: true,
		},
	},
	{ collection: "users_notifications" }
);

const UsersNotifications = mongoose.model("UsersNotifications", usersNotifications);
export type TUsersNotifications = InferSchemaType<typeof usersNotifications>;
export { UsersNotifications };

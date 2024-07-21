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
		additionalInfo: {
			usersPatternID: {
				type: Schema.Types.ObjectId,
			},
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
	{ collection: "users_notifications" }
);

const UsersNotifications = mongoose.model("UsersNotifications", usersNotifications);
export type TUsersNotifications = InferSchemaType<typeof usersNotifications>;
export { UsersNotifications };

import mongoose, { InferSchemaType, Schema } from "mongoose";

const pushNotifications = new Schema(
	{
		code: {
			type: String,
			required: true,
		},
		displayName: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		subtitle: {
			type: String,
			required: true,
		},
		body: {
			type: String,
			required: true,
		},
		data: {
			type: Object,
		},
		isWithSound: {
			type: Boolean,
			required: true,
			default: true,
		},
		active: {
			type: Boolean,
			required: true,
			default: true,
		},
		created: {
			type: Date,
			required: true,
			default: Date.now,
		},
	},
	{
		collection: "push_notifications",
	}
);

const PushNotifications = mongoose.model("PushNotifications", pushNotifications);
export type TPushNotifications = InferSchemaType<typeof PushNotifications>;

export { PushNotifications };

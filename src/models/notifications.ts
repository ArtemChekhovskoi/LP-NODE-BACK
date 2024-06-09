import mongoose, { InferSchemaType, Schema } from "mongoose";

const notifications = new Schema({
	type: {
		type: String,
		required: true,
		unique: true,
	},
	displayType: {
		type: String,
		required: true,
		enum: ["block", "modal"],
	},
	screen: {
		type: String,
		required: true,
		enum: ["main/today", "main/patterns", "main/trends"],
	},
	slot: {
		type: Number,
	},
	title: {
		type: String,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
	isButtonExists: {
		type: Boolean,
		required: true,
	},
	buttonText: {
		type: String,
	},
	isClickable: {
		type: Boolean,
		required: true,
	},
	buttonLink: {
		type: String,
	},
	active: {
		type: Boolean,
		required: true,
	},
});

const Notifications = mongoose.model("Notifications", notifications);
export type TNotifications = InferSchemaType<typeof notifications>;
export { Notifications };

import mongoose, { InferSchemaType, Schema } from "mongoose";

const measurements = new Schema({
	name: {
		type: String,
		required: true,
	},
	code: {
		type: String,
		required: true,
		unique: true,
	},
	unit: {
		type: String,
		required: true,
	},
	precision: {
		type: Number,
	},
	type: {
		type: String,
		required: true,
		enum: ["custom", "auto"],
	},
	isUsedOnMainScreen: {
		type: Boolean,
		required: true,
	},
	active: {
		type: Boolean,
		required: true,
	},
});

const Measurements = mongoose.model("Measurements", measurements);
export type Measurement = InferSchemaType<typeof measurements>;
export { Measurements };

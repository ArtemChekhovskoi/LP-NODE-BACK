import mongoose, { InferSchemaType, Schema } from "mongoose";

const measurements = new Schema({
	name: {
		type: String,
		required: true,
	},
	shortName: {
		type: String,
	},
	code: {
		type: String,
		required: true,
		unique: true,
	},
	unit: {
		type: String,
	},
	precision: {
		type: Number,
	},
	active: {
		type: Boolean,
		required: true,
	},
});

const Measurements = mongoose.model("Measurements", measurements);
export type Measurement = InferSchemaType<typeof measurements>;
export { Measurements };

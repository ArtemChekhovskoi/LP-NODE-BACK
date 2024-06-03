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
		required: true,
	},
	precision: {
		type: Number,
		required: true,
	},
	displayColor: {
		primary: {
			type: String,
		},
		secondary: {
			type: String,
		},
	},
	valuesRange: {
		min: {
			type: Number,
			required: true,
		},
		max: {
			type: Number,
			required: true,
		},
		scale: {
			type: [Number],
			required: true,
		},
	},
	active: {
		type: Boolean,
		required: true,
	},
});

const Measurements = mongoose.model("Measurements", measurements);
export type Measurement = InferSchemaType<typeof measurements>;
export { Measurements };

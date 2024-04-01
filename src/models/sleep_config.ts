import mongoose, { InferSchemaType, Schema } from "mongoose";

const sleepConfig = new Schema(
	{
		code: {
			type: Number,
			required: true,
		},
		shortName: {
			type: String,
			required: true,
		},
		fullName: {
			type: String,
			required: true,
		},
		isSleepStage: {
			type: Boolean,
			required: true,
		},
		sleepStage: {
			type: String,
			default: null,
		},
	},
	{ collection: "sleep_config" }
);

const SleepConfig = mongoose.model("sleep_config", sleepConfig);
export type TSleepConfig = InferSchemaType<typeof sleepConfig>;
export { SleepConfig };

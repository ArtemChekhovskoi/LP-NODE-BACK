import mongoose, { InferSchemaType, Schema } from "mongoose";

const openaiPatterns = new Schema(
	{
		pair: [
			{
				measurementCode: {
					type: String,
					required: true,
				},
				displayName: {
					type: String,
					required: true,
				},
				recordsToFetch: {
					min: {
						type: Number,
						required: true,
					},
					max: {
						type: Number,
						required: true,
					},
				},
			},
		],
		compareIntervalType: {
			type: String,
			enum: ["days", "weeks", "months", "years"],
			required: true,
		},
		compareIntervalValue: {
			type: Number,
			required: true,
		},
		sort: {
			type: Number,
			required: true,
		},
		active: {
			type: Boolean,
			required: true,
			default: true,
		},
	},
	{ collection: "openai_patterns" }
);

const OpenaiPatterns = mongoose.model("openai_patterns", openaiPatterns);
export type TOpenaiPatterns = InferSchemaType<typeof OpenaiPatterns>;
export { OpenaiPatterns };

import mongoose, { InferSchemaType, Schema } from "mongoose";

const activitiesConfig = new Schema(
	{
		code: {
			type: Number,
			required: true,
			unique: true,
		},
		shortName: {
			type: String,
			required: true,
		},
		fullName: {
			type: String,
			required: true,
		},
		emoji: {
			raw: {
				type: String,
				default: "🏃",
			},
			unicode: {
				type: String,
				default: "U+1F3C3",
			},
		},
	},
	{ collection: "activities_config" }
);

const ActivitiesConfig = mongoose.model("activities_config", activitiesConfig);
export type TActivitiesConfig = InferSchemaType<typeof activitiesConfig>;
export { ActivitiesConfig };

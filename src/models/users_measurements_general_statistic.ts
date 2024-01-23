import mongoose, { InferSchemaType, Schema } from "mongoose";

const usersMeasurementsGeneralStatistic = new Schema(
	{
		usersID: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		totalDaysMeasurements: {
			type: Number,
			required: true,
		},
		syncedMeasurements: [
			{
				type: String,
				required: true,
			},
		],
		lastUpdated: {
			type: Date,
			required: true,
			default: Date.now(),
		},
	},
	{
		collection: "users_measurements_general_statistic",
	}
);

const UsersMeasurementsGeneralStatistic = mongoose.model("UsersMeasurementsGeneralStatistic", usersMeasurementsGeneralStatistic);
export type UserMeasurementsGeneralStatistic = InferSchemaType<typeof usersMeasurementsGeneralStatistic>;
export { UsersMeasurementsGeneralStatistic };

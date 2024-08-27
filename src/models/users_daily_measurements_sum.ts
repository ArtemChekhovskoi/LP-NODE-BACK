import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersDailyMeasurementsSum = new Schema(
	{
		usersID: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: Users.collection.name,
		},
		measurementCode: {
			type: String,
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
		value: {
			type: Number,
			required: true,
		},
		lastUpdated: {
			type: Date,
			required: true,
			default: Date.now,
		},
		created: {
			type: Date,
			required: true,
			default: Date.now,
		},
	},
	{ collection: "users_daily_measurements_sum" }
);

const UsersDailyMeasurementsSum = mongoose.model("users_daily_measurements_sum", usersDailyMeasurementsSum);
export type TUsersDailyMeasurementsSum = InferSchemaType<typeof usersDailyMeasurementsSum>;
export { UsersDailyMeasurementsSum };

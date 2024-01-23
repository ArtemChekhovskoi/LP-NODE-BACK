import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersDailyMeasurements = new Schema({
	usersID: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: Users.collection.name,
	},
	date: {
		type: Date,
		required: true,
	},
	measurementCode: {
		type: String,
		required: true,
	},
	source: {
		type: String,
		required: true,
	},
	value: {
		type: Number,
		required: true,
	},
	startDate: {
		type: Date,
	},
	endDate: {
		type: Date,
	},
	lastUpdated: {
		type: Date,
		required: true,
	},
});

const UsersDailyMeasurements = mongoose.model("users_daily_measurements", usersDailyMeasurements);
export type TUsersDailyMeasurements = InferSchemaType<typeof usersDailyMeasurements>;
export { UsersDailyMeasurements };

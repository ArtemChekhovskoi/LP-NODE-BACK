import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersDailyWeather = new Schema(
	{
		usersID: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: Users.collection.name,
		},
		date: {
			type: Date,
			required: true,
		},
		location: {
			name: {
				type: String,
				required: true,
			},
			region: {
				type: String,
				required: true,
			},
			country: {
				type: String,
				required: true,
			},
		},
		title: {
			type: String,
			required: true,
		},
		avgTemp_c: {
			type: Number,
			required: true,
		},
		humidity: {
			type: Number,
			required: true,
		},
		wind_kph: {
			type: Number,
			required: true,
		},
		icon: {
			type: String,
		},
		lastUpdated: {
			type: Date,
			required: true,
		},
	},
	{ collection: "users_daily_weather" }
);

const UsersDailyWeather = mongoose.model("users_daily_weather", usersDailyWeather);
export type TUsersDailyWeather = InferSchemaType<typeof usersDailyWeather>;
export { UsersDailyWeather };

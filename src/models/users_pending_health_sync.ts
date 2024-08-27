import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersPendingHealthSync = new Schema(
	{
		usersID: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: Users.collection.name,
		},
		syncedCollections: [
			{
				type: String,
			},
		],
		totalRecordsCount: {
			type: Number,
			required: true,
		},
		progress: {
			type: Number,
			required: true,
			default: 0,
		},
		created: {
			type: Date,
			required: true,
			default: Date.now,
		},
	},
	{ collection: "users_pending_health_sync" }
);

const UsersPendingHealthSync = mongoose.model("users_pending_health_sync", usersPendingHealthSync);
export type TUsersPendingHealthSync = InferSchemaType<typeof UsersPendingHealthSync>;
export { UsersPendingHealthSync };

import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";

const usersDailyCustomMeasurements = new Schema({
  usersID: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: Users.collection.name,
  },
  date: {
    type: Date,
    required: true,
  },
  lastUpdated: {
    type: Date,
    required: true,
  },
  measurements: [
    {
      code: {
        type: String,
        required: true,
      },
      value: {
        type: Number,
      },
      customFields: {
        type: Object,
      },
    },
  ],
});

const UsersDailyCustomMeasurements = mongoose.model(
  "users_daily_custom_measurements",
  usersDailyCustomMeasurements,
);
export type User = InferSchemaType<typeof usersDailyCustomMeasurements>;
export { UsersDailyCustomMeasurements };

import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";
import { Measurements } from "@models/measurements";

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
  lastUpdated: {
    type: Date,
    required: true,
  },
  measurements: [
    {
      measurementID: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: Measurements.collection.name,
      },
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

const UsersDailyMeasurements = mongoose.model(
  "users_daily_measurements",
  usersDailyMeasurements,
);
export type User = InferSchemaType<typeof usersDailyMeasurements>;
export { UsersDailyMeasurements };

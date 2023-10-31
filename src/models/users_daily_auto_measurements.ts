import mongoose, { InferSchemaType, Schema } from "mongoose";
import { Users } from "@models/users";
import { Measurements } from "@models/measurements";

const usersDailyAutoMeasurements = new Schema({
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
      },
      code: {
        type: String,
        required: true,
      },
      unit: {
        type: String,
      },
      source: {
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

const UsersDailyAutoMeasurements = mongoose.model(
  "users_daily_auto_measurements",
  usersDailyAutoMeasurements,
);
export type UsersDailyAutoMeasurement = InferSchemaType<
  typeof usersDailyAutoMeasurements
>;
export { UsersDailyAutoMeasurements };

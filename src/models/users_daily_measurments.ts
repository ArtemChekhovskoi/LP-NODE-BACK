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
  lastUpdated: {
    type: Date,
    required: true,
  },
  weight: {
    value: {
      type: Number,
    },
    measurementID: {
      type: Schema.Types.ObjectId,
    },
  },
  height: {
    value: {
      type: Number,
    },
    unit: {
      type: String,
    },
    type: {
      type: String,
      enum: ["custom", "auto"],
    },
  },
  hateRateSample: {
    value: {
      type: Number,
    },
    unit: {
      type: String,
    },
  },
  steps: {
    value: {
      type: Number,
    },
    unit: {
      type: String,
    },
  },
});

const UsersDailyMeasurements = mongoose.model(
  "UsersDailyMeasurements",
  usersDailyMeasurements,
);
export type User = InferSchemaType<typeof usersDailyMeasurements>;
export { UsersDailyMeasurements };

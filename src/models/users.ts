import mongoose, { InferSchemaType, Schema } from "mongoose";

const users = new Schema(
  {
    socialAccounts: {
      google: {
        type: String,
      },
      apple: {
        type: String,
      },
      facebook: {
        type: String,
      },
    },
    name: {
      type: String,
      required: true,
    },
    created: {
      type: Date,
      required: true,
    },
    lastUpdated: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    appsConnected: [
      {
        type: String,
      },
    ],
    regLocation: {
      long: {
        type: Number,
      },
      lat: {
        type: Number,
      },
      place: {
        type: String,
      },
    },
    dataTrackingType: {
      type: String,
    },
    registrationStep: {
      type: String,
      enum: ["new", "gender", "connectApp", "location", "complete"],
    },
    lastSyncDate: {
      type: Date,
    },
  },
  {
    collection: "users",
  },
);

const Users = mongoose.model("Users", users);
export type User = InferSchemaType<typeof users>;
export { Users };

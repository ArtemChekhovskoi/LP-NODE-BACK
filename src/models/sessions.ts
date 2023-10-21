import mongoose, { InferSchemaType, Schema } from "mongoose";

const sessions = new Schema(
  {
    usersID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    type: [
      {
        type: String,
        required: true,
      },
    ],
    accessTokenTTL: {
      type: Number,
      required: true,
    },
    userAgent: {
      type: String,
    },
    created: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
  },
  {
    collection: "sessions",
  },
);

const Sessions = mongoose.model("Sessions", sessions);
export type Session = InferSchemaType<typeof sessions>;
export { Sessions };

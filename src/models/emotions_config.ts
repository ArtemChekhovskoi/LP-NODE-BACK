import mongoose, { InferSchemaType, Schema } from "mongoose";

const emotionsConfig = new Schema(
  {
    emotion: {
      type: String,
      required: true,
    },
    emoji: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    sort: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { collection: "emotions_config" },
);

const EmotionsConfig = mongoose.model("emotions_config", emotionsConfig);
export type TEmotionsConfig = InferSchemaType<typeof emotionsConfig>;
export { EmotionsConfig };

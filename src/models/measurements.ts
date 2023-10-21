import mongoose, { InferSchemaType, Schema } from "mongoose";

const measurements = new Schema({
  name: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["custom", "auto"],
  },
  active: {
    type: Boolean,
    required: true,
  },
});

const Measurements = mongoose.model("Measurements", measurements);
export type Measurement = InferSchemaType<typeof measurements>;
export { Measurements };

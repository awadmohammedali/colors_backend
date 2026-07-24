import mongoose from "mongoose";

const { Schema } = mongoose;

const gameVariantSchema = new Schema(
  {
    name: {
      type: Map,
      of: String,
      required: true,
    },
    instruction: {
      type: Map,
      of: String,
      default: {},
    },
    icon: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    timer: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

gameVariantSchema.index({ order: 1 });

export default mongoose.model("GameVariant", gameVariantSchema);

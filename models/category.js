import mongoose from "mongoose";

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: Map,
      of: String,
      required: true,
    },
    description: {
      type: Map,
      of: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ order: 1 });

export default mongoose.model("Category", categorySchema);

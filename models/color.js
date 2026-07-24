import mongoose from "mongoose";

const Schema = mongoose.Schema;

const colorsSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    icon: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    variants: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "GameVariant",
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Color", colorsSchema);

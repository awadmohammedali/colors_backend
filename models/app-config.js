import mongoose from "mongoose";

const { Schema } = mongoose;

const appConfigSchema = new Schema(
  {
    key: {
      type: String,
      unique: true,
      immutable: true,
    },

    androidAppVersion: {
      type: String,
      default: "1.0.0",
    },

    IOSAppVersion: {
      type: String,
      default: "1.0.0",
    },
    blueGameCategorySelections: {
      type: Number,
      default: 4,
    },
    stagesCount: {
      type: Number,
      default: 12,
    },
    whiteColorPercentage: {
      type: Number,
      default: 12,
    },
    scoresValue: {
      type: Map,
      of: String,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model("AppConfig", appConfigSchema);

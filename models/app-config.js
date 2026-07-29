import mongoose from "mongoose";

const { Schema } = mongoose;

const appConfigSchema = new Schema(
  {
    key: {
      type: String,
      default: "APP_CONFIG",
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
      default: 3,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model("AppConfig", appConfigSchema);

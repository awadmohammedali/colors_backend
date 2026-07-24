import mongoose from "mongoose";

const { Schema } = mongoose;

const leaderboardSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "Leaderboard",
  leaderboardSchema,
);

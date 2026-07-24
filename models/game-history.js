import mongoose from "mongoose";

const Schema = mongoose.Schema;

const gameHistorySchema = new Schema(
  {
    titleAr: {
      type: String,
      required: true,
    },
    titleEn: {
      type: String,
      required: true,
    },
    subCategories: {
      type: [String],
    },
    minimumPlayersNum: {
      type: Number,
      default: 3,
    },
    questionsTimer: {
      type: Number,
      default: 26,
    },
    noteForPlayers: {
      type: String,
    },
    descriptionAr: {
      type: String,
    },
    descriptionEn: {
      type: String,
    },
    isParent: {
      type: Boolean,
      default: true,
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    sort: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("GameHistory", gameHistorySchema);

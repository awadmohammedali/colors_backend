import mongoose from "mongoose";

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    question: {
      type: Map,
      of: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },
    jokerAnswer: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Question", questionSchema);

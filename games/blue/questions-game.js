import Question from "../../models/question.js";
export const getQuestion = async ({ categoryId }) => {
  const questions = await Question.find({ categoryId });

  return questions[0];
};

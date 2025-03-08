const mongoose = require("mongoose");

const interviewSetupSchema = new mongoose.Schema(
  {
    jobDescription: {
      type: String,
      required: true,
    },
    numberOfQuestions: {
      type: Number,
      required: true,
    },
    difficultyLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSetup", interviewSetupSchema);

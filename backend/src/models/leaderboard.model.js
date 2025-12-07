import mongoose, { Schema } from "mongoose";

const leaderboardSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const LeaderBoard = mongoose.model("LeaderBoard", leaderboardSchema);

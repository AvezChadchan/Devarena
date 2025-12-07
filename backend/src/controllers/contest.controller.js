import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Contest } from "../models/contest.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Submission } from "../models/submissions.model.js";
const createContest = asyncHandler(async (req, res) => {
  let { name, description, startTime, endTime, problems = [] } = req.body;

  startTime = new Date(startTime);
  endTime = new Date(endTime);

  if (!name || !description || !startTime || !endTime) {
    throw new apiError(
      400,
      "Name, description, startTime and endTime are required"
    );
  }

  if (startTime >= endTime) {
    throw new apiError(402, "Start time must be earlier than end time");
  }

  if (!Array.isArray(problems)) {
    throw new apiError(400, "Problems must be an array");
  }

  const contest = await Contest.create({
    name: name.toLowerCase(),
    description,
    startTime,
    endTime,
    problems,
    createdBy: req.user._id,
  });

  return res
    .status(200)
    .json(new apiResponse(200, contest, "Contest Created Successfully"));
});

const getContests = asyncHandler(async (req, res) => {
  const contests = await Contest.find({}).sort({ startTime: 1 });

  const now = new Date();

  const list = contests.map((contest) => {
    let status = "upcoming";

    if (now < contest.startTime) {
      status = "upcoming";
    } else if (now > contest.endTime) {
      status = "ended";
    } else {
      status = running;
    }

    return {
      id: contest._id,
      name: contest.name,
      description: contest.description,
      startTime: contest.startTime,
      endTime: contest.endTime,
      status,
      totalProblems: Array.isArray(contest.problems)
        ? contest.problems.length
        : 0,
    };
  });

  return res
    .status(200)
    .json(new apiResponse(200, list, "All contests Fetched"));
});

const getContestDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new apiError(404, "Contest ID is Required");
  }
  const contest = await Contest.findById(id)
    .populate(
      "problems",
      "title difficulty points description sampleInput sampleOutput"
    )
    .populate("createdBy", "username");
  if (!contest) {
    throw new apiError(405, "Contest not found");
  }
  const now = new Date();
  let status = "upcoming";
  if (now < contest.startTime) {
    status = "upcoming";
  } else if (now > contest.endTime) {
    status = "ended";
  } else {
    status = "running";
  }
  const result = {
    id: contest._id,
    name: contest.name,
    description: contest.description,
    startTime: contest.startTime,
    endTime: contest.endTime,
    status,
    problems: contest.problems,
    createdBy: contest.createdBy,
  };
  return res
    .status(200)
    .json(new apiResponse(200, result, "Contest Details Fetched"));
});

const joinContest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!id) {
    throw new apiError(400, "Contest ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid Contest ID");
  }

  const contest = await Contest.findById(id);
  if (!contest) {
    throw new apiError(404, "Contest not found");
  }

  const alreadyJoined = contest.participants.some((u) => u.equals(userId));
  if (alreadyJoined) {
    throw new apiError(400, "User has already joined the contest");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  contest.participants.push(userId);
  user.joinedContests.push(contest._id);

  await contest.save();
  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, {}, "User joined contest successfully"));
});

const getContestParticipants = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new apiError(400, "Contest ID is requried");
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid contest ID");
  const contest = await Contest.findById(id).populate(
    "participants",
    "username email score"
  );
  if (!contest) throw new apiError(404, "Contest not found");
  return res.status(200).json(
    new apiResponse(
      200,
      {
        contestId: contest._id,
        contestName: contest.name,
        participants: contest.participants,
      },
      "Contest participants fethced"
    )
  );
});

const getUserContests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate(
    "joinedContests",
    "name startTime endTime problems"
  );
  if (!user) throw new apiError("User not found");
  const now = new Date();
  const contest = user.joinedContests.map((contest) => {
    let status = "upcoming";
    if (now < contest.startTime) {
      status = "upcoming";
    } else if (now > contest.endTime) {
      status = "ended";
    } else {
      status = "running";
    }
    return {
      id: contest._id,
      name: contest.name,
      startTime: contest.startTime,
      endTime: contest.endTime,
      status,
      problemCount: contest.problems?.length || 0,
    };
  });
  return res
    .status(200)
    .json(new apiResponse(200, contest, "User contests fetched"));
});

const getContestLeaderboard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new apiError(400, "Contest ID is required");
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid Contest ID");
  }
  const contestId = new mongoose.Types.ObjectId(id);
  const contestExits = await Contest.exists({ _id: contestId });
  if (!contestExits) throw new apiError(404, "Contest not found");
  const leaderboard = await Submission.aggregate([
    {
      $match: {
        contest: contestId,
        verdict: "Accepted",
      },
    },
    {
      $group: {
        _id: "$user",
        totalScore: { $sum: "$pointsAwarded" },
        lastAcceptedAt: { $min: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $match: {
        "user.role": "user",
      },
    },
    {
      $project: {
        userId: "$user._id",
        username: "$user.username",
        email: "$user.email",
        totalScore: 1,
        lastAcceptedAt: 1,
      },
    },
    {
      $sort: {
        totalScore: -1,
        lastAcceptedAt: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new apiResponse(200, leaderboard, "Contest leaderboard fetched"));
});

export {
  createContest,
  getContests,
  getContestDetail,
  joinContest,
  getContestParticipants,
  getUserContests,
  getContestLeaderboard,
};

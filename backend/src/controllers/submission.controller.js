import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Problem } from "../models/problem.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Submission } from "../models/submissions.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Contest } from "../models/contest.model.js";

const submitCode = asyncHandler(async (req, res) => {
  const { problemId, code, language, contestId } = req.body;
  if (
    [problemId, code, language].some((field) => !field || field?.trim() === "")
  ) {
    throw new apiError(400, "Problem Id, language,  and code are required");
  }
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new apiError(400, "Invalid problemId");
  }

  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw new apiError(404, "Problem not found");
  }
  let contest = null;
  if (contestId) {
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      throw new apiError(400, "Invalid ContestId");
    }
    contest = await Contest.findById(contestId);
    if (!contest) {
      throw new apiError(404, "Contest not found");
    }
    const problemInContest = contest.problems.some((p) =>
      p instanceof mongoose.Types.ObjectId
        ? p.equals(problem._id)
        : String(p) === String(problem._id)
    );
    if (!problemInContest) {
      throw new apiError(
        404,
        "This problem is not part of the selected contest"
      );
    }
    const userId = req.user._id;
    const hasJoined = contest.participants.some((u) =>
      u instanceof mongoose.Types.ObjectId
        ? u.equals(userId)
        : String(u) === String(userId)
    );
    if (!hasJoined)
      throw new apiError(403, "You must join the contest before submitting");

    const now = new Date();
    if (now < contest.startTime) {
      throw new apiError(400, "Contest has not started yet");
    }
    if (now > contest.endTime) {
      throw new apiError(400, "Contest has already ended");
    }
  }

  const LANGUAGE_MAP = {
    python: 71,
    javascript: 63,
    java: 62,
    cpp: 54,
    c: 50,
  };

  const langKey = String(language).toLowerCase();
  const language_id = LANGUAGE_MAP[langKey];
  if (!language_id)
    throw new apiError(400, `Unsupported language: ${language}`);

  if (String(code).length > 20000) throw new apiError(400, "Code too large.");
  if (String(problem.sampleInput || "").length > 20000)
    throw new apiError(400, "Problem input too large.");

  const judgeUrl = `${process.env.JUDGE0_BASE || "https://judge0-ce.p.rapidapi.com"}/submissions?base64_encoded=false&wait=true`;
  const headers = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    "X-RapidAPI-Host": process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com",
  };

  let judgeData;
  try {
    const axiosOptions = {
      method: "POST",
      url: judgeUrl,
      headers,
      timeout: 20000,
      data: {
        source_code: code,
        language_id,
        stdin: problem.sampleInput || "",
      },
    };

    const { data } = await axios.request(axiosOptions); // it sends the options to judge0 and gets the response or Send the code to Judge0 → Wait for Judge0 → Get the output → Store only the important part.
    judgeData = data;
  } catch (error) {
    console.error(
      "Judge0 request error:",
      error?.response?.data || error.message || error
    );
    throw new apiError(502, "Error evaluating code (judge service error)");
  }

  //getting response
  const stdout = (judgeData.stdout || "").toString().trim();
  const compileOutput = judgeData.compile_output || null;
  const stderr = judgeData.stderr || null;
  const expected = (problem.sampleOutput || "").toString().trim();

  let verdict = "Pending";
  let pointsAwarded = 0;

  if (stdout === expected && !stderr && !compileOutput) {
    verdict = "Accepted";
    pointsAwarded = Number(problem.points) || 0;
  } else if (compileOutput) {
    verdict = "Compile Output";
  } else if (stderr) {
    verdict = "Runtime Error";
  } else {
    verdict = "Wrong Answer";
  }

  //saving submission
  const submission = await Submission.create({
    user: req.user._id,
    problem: problem._id,
    contest: contest ? contest._id : null,
    code,
    language: langKey,
    verdict,
    pointsAwarded,
  });

  //update user score
  if (verdict === "Accepted" && pointsAwarded > 0) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user._id);
      const problemIdObj = new mongoose.Types.ObjectId(problem._id);

      // count previous accepted submissions excluding the current one
      const acceptedCount = await Submission.countDocuments({
        user: userId,
        problem: problemIdObj,
        verdict: "Accepted",
        _id: { $ne: submission._id },
      });

      if (acceptedCount === 0) {
        await User.updateOne(
          { _id: userId },
          { $inc: { score: pointsAwarded } }
        );
      } else {
        console.log(
          "User already had an Accepted submission before; not incrementing score"
        );
      }
    } catch (err) {
      console.error("ERROR updating user score:", err);
    }
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        submissionId: submission._id,
        verdict,
        output: stdout,
        compileOutput: compileOutput
          ? String(compileOutput).slice(0, 2000)
          : null,
        stderr: stderr ? String(stderr).slice(0, 2000) : null,
        pointsAwarded,
      },
      "Code evaluated"
    )
  );
});

const getUserSubmissions = asyncHandler(async (req, res) => {
  // populate
  // const submissions = await Submission.find({ user: req.user._id })
  //   .populate("problem", "title difficulty points")
  //   .sort({ createdAt: -1 });

  // aggregation pipelines
  const submissions = await Submission.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "problems",
        localField: "problem",
        foreignField: "_id",
        as: "problemDetails",
      },
    },
    {
      $unwind: "$problemDetails",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        "problemDetails.title": 1,
        "problemDetails.points": 1,
        "problemDetails.difficulty": 1,
        code: 1,
        language: 1,
        verdict: 1,
        createdAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new apiResponse(200, submissions, "User submission fetched"));
});

const getProblemSubmissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid problem id");
  }
  const submissions = await Submission.aggregate([
    {
      $match: {
        problem: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        code: 1,
        language: 1,
        verdict: 1,
        pointsAwarded: 1,
        createdAt: 1,
        "userDetails._id": 1,
        "userDetails.username": 1,
        "userDetails.email": 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new apiResponse(200, submissions, "Problem submissions fetched"));
});

export { submitCode, getUserSubmissions, getProblemSubmissions };

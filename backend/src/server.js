import dotenv from "dotenv";
import { app } from "./app.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import connectDB from "./db/db.js";

dotenv.config({ path: "./.env" });
connectDB()
  .then((req, res) => {
    app.on("error", (error) => {
      console.log("ERROR:", error);
      throw error;
    });
    app.get(
      "/",
      asyncHandler(async (req, res) => {
        res.send("MongoDB Connected!!!");
      })
    );
    app.post("/test", (req, res) => {
      console.log(req.body);
      res.send("Received");
    });
    app.listen(process.env.PORT, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log(`MongoDB connection Failed!`, error));

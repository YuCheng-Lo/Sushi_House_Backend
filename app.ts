import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import imageRoute from "./routes/imageRoute.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import "./jobs/cleanupSession.js";

const app = express();
const PORT: number = 3000;

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoute);
app.use("/image", imageRoute);

app.get("/", (req, res) => {
  return res.send("Let Sushi House Great Agint Again");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("伺服器正在PORT 3000上運行中。。。");
});

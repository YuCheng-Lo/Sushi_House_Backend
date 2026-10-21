import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import sectionRoute from "./routes/sectionRoute.js";
import imageRoute from "./routes/imageRoute.js";
import menuItemRoute from "./routes/menuItemRoute.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import "./jobs/cleanupSession.js";
import helmet from "helmet";

const app = express();
const PORT: number = 3000;

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoute);
app.use("/sections", sectionRoute);
app.use("/image", imageRoute);
app.use("/menu-items", menuItemRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("伺服器正在PORT 3000上運行中。。。");
});

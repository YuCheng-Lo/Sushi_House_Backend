import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const PORT: number = 3000;

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoute);

app.get("/", (req, res) => {
  return res.send("Let Sushi House Great Agint Again");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("伺服器正在PORT 3000上運行中。。。");
});

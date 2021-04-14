import express from "express";
import { PORT, DB_URL } from "./config";
import errorHandler from "./middlewares/error";
import routes from "./routes";
import mongoose from "mongoose";
import path from "path";

const app = express();

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("DB connected...");
});

global.root = path.resolve(__dirname);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", routes);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

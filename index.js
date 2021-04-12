import express from "express";
import { PORT } from "./config";
import errorHandler from "./middlewares/error";
import routes from "./routes";

const app = express();

app.use(express.json());

app.use("/api", routes);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

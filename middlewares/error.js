import { ValidationError } from "joi";
import { DEBUG_MODE } from "../config";

export default (err, req, res, next) => {
  let statusCode = 500;
  let data = {
    message: "Internal Server Error",
    ...(DEBUG_MODE === "true" && { originalError: err.message }),
  };

  if (err instanceof ValidationError) {
    statusCode = 422;
    data = {
      message: err.message,
    };
  }

  return res.status(statusCode).json(data);
};

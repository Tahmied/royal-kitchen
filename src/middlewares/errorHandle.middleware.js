import { ApiError } from "../utils/apiError.js";

export const errorHandler = (err, req, res, next) => {
  // If it's an instance of your custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }

  // For other unexpected errors
  console.error(err); // optional: log the stack for debugging
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [],
  });
};

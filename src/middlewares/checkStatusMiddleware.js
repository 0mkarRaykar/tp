import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * Middleware to check if the document is active and not deleted
 * @param {mongoose.Model} model - The Mongoose model to query
 * @returns {Function} Middleware function
 */
export const checkActiveAndNotDeleted = asyncHandler((model) => {
  return async (req, _, next) => {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid ID format"));
    }

    // Fetch the document by ID
    const document = await model.findById(id);

    // Check if the document exists
    if (!document) {
      return next(new ApiError(404, "Document not found"));
    }

    // Check the isActive and isDeleted fields
    if (!document.isActive) {
      return next(new ApiError(403, "Document is not active"));
    }

    if (document.isDeleted) {
      return next(new ApiError(403, "Document is deleted"));
    }

    // Attach the document to the request object for further use
    req.document = document;

    // Proceed to the next middleware or route handler
    next();
  };
});

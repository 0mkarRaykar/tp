import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { generateAccessAndRefreshTokens } from "../utils/tokenUtils.js";  // Assuming you move token generation logic here

export const handler = async (event, context) => {
  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify(new ApiError(400, "Email and password are required")),
    };
  }

  const user = await User.findOne({ email, isActive: true, isDeleted: false });
  if (!user) {
    return {
      statusCode: 400,
      body: JSON.stringify(new ApiError(400, "User not found")),
    };
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return {
      statusCode: 401,
      body: JSON.stringify(new ApiError(401, "Invalid credentials")),
    };
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  return {
    statusCode: 200,
    body: JSON.stringify(new ApiResponse(200, { accessToken, refreshToken }, "User logged in successfully")),
  };
};

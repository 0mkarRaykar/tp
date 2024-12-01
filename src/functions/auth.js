import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

// @desc     generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();  // Assuming this is a method on the User model
    const refreshToken = user.generateRefreshToken(); // Assuming this is a method on the User model

    user.refreshToken = refreshToken;  // Save the refresh token in the user document
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};

// @desc     User login and generate tokens
// @route    POST /api/v1/auths/login
// @access   Public
const loginUser = asyncHandler(async (event, context) => {
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
});

// @desc     Refresh the access token
// @route    POST /api/v1/auths/refresh-token
// @access   Private
const refreshAccessToken = asyncHandler(async (event, context) => {
  const incomingRefreshToken =
    event.headers['refreshToken'] || JSON.parse(event.body)?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request, refresh token is missing");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return {
      statusCode: 200,
      body: JSON.stringify(new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed"
      )),
    };
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// Export the handler for Netlify
export const handler = async (event, context) => {
  // Handle different paths based on the event path
  if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/auth/login') {
    return await loginUser(event, context);
  } else if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/auth/register') {
    return await refreshAccessToken(event, context);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Route not found' }),
  };
};

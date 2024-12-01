import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken(); // Assuming this is a method on the User model
    const refreshToken = user.generateRefreshToken(); // Assuming this is a method on the User model

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Token generation failed.");
  }
};

const loginUser = async (event) => {
  try {
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
        statusCode: 404,
        body: JSON.stringify(new ApiError(404, "User not found")),
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
      body: JSON.stringify(new ApiResponse(200, { accessToken, refreshToken }, "Login successful")),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify(new ApiError(error.statusCode || 500, error.message || "Internal Server Error")),
    };
  }
};

const refreshAccessToken = async (event) => {
  try {
    const incomingRefreshToken =
      event.headers['refreshToken'] || JSON.parse(event.body)?.refreshToken;

    if (!incomingRefreshToken) {
      return {
        statusCode: 401,
        body: JSON.stringify(new ApiError(401, "Refresh token missing")),
      };
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);

    if (!user || incomingRefreshToken !== user.refreshToken) {
      return {
        statusCode: 401,
        body: JSON.stringify(new ApiError(401, "Invalid or expired refresh token")),
      };
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return {
      statusCode: 200,
      body: JSON.stringify(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed")),
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify(new ApiError(401, "Invalid refresh token")),
    };
  }
};

export const handler = async (event) => {
  try {
    const path = event.path.split('/').pop(); // Extract last part of path

    if (event.httpMethod === 'POST' && path === 'login') {
      return await loginUser(event);
    } else if (event.httpMethod === 'POST' && path === 'refresh-token') {
      return await refreshAccessToken(event);
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Route not found" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(new ApiError(500, "Server error")),
    };
  }
};

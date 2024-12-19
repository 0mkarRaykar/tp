import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Define connectDB function directly in auth.js
const connectDB = async () => {
  try {
    // Replace with your MongoDB URI and database name
    const dbURI = process.env.MONGODB_URI; // Your MongoDB URI
    const dbName = process.env.DB_NAME;    // Your DB Name

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName,
    });

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("Database connection error:", error);
    throw new ApiError(500, "Database connection failed");
  }
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    await connectDB(); // Ensure the connection is established
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

    await connectDB(); // Ensure the connection is established

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
    console.error("Error in loginUser:", error); // Add this
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: error.message || "Internal server error" }),
    };
  }
};

const refreshAccessToken = async (event) => {
  try {
    await connectDB(); // Ensure the connection is established

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
    console.error("Error in refreshtokrn:", error); // Add this
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: error.message || "Internal server error" }),
    };
  }
};

export const handler = async (event) => {
  try {
    const path = event.path.split('/').pop(); // Extract last part of path

    // Route for login
    if (event.httpMethod === 'POST' && path === 'login') {
      return await loginUser(event);
    }
    
    // Route for refresh token
    else if (event.httpMethod === 'POST' && path === 'refresh-token') {
      return await refreshAccessToken(event);
    }

    // Route for root
    else if (event.httpMethod === 'POST' && path === 'test') {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "hello world" }),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Route not found" }),
    };
  } catch (error) {
    console.error("Unhandled error in handler:", error); // Add detailed logging
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: error.message }),
    };
  }
};


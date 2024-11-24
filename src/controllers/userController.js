import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { User } from "../models/userModel.js";

const getAllUsers = asyncHandler(async (req, res) => {});
const getUserById = asyncHandler(async (req, res) => {});
const updateUser = asyncHandler(async (req, res) => {});
const deleteUser = asyncHandler(async (req, res) => {});

export { getAllUsers, getUserById, updateUser, deleteUser };

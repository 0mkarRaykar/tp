import mongoose, { isValidObjectId } from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { User } from "../models/userModel.js";

// @desc     fetch all user from db (role based fetching)
// route     GET api/v1/users/getAllUsers
// @accesss  Private

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    // Fetch the role of the requesting user
    const requestingUser = await User.findById(req.user._id); 
    if (!requestingUser) {
      throw new ApiError(404, "Requesting user not found");
    }

    let roleFilter = {};

    // Define role-based filters
    switch (requestingUser.role) {
      case "SuperAdmin":
        roleFilter = {
          role: { $in: ["DistrictAdmin", "FacilityAdmin", "DepartmentUser"] },
        };
        break;
      case "DistrictAdmin":
        roleFilter = { role: { $in: ["FacilityAdmin", "DepartmentUser"] } };
        break;
      case "FacilityAdmin":
        roleFilter = { role: "DepartmentUser" };
        break;
      default:
        throw new ApiError(
          403,
          "You are not authorized to access this resource"
        );
    }

    // Fetch users based on the role filter, active status, and non-deleted status
    const users = await User.find({
      ...roleFilter,
      isActive: true,
      isDeleted: false,
    });

    // Return the fetched users
    res
      .status(200)
      .json(new ApiResponse(200, "Users fetched successfully", users));
  } catch (error) {
    console.error("Error fetching users based on role:", error);
    throw new ApiError(500, "An error occurred while fetching users");
  }
});

// @desc     fetch a user by Id from db
// route     GET api/v1/users/{id}
// @accesss  Private
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // validate userId parameter
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // find the user by ID
  const user = await User.findById(userId);

  //check if the user was found
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  // return the user details
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

// @desc     update user by Id from db
// route     PATCH api/v1/users/{id}
// @accesss  Private
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { fullName, email, mobileNumber } = req.body;

  // validate user
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  //Prepare the update object
  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (email) updateData.email = email;
  if (mobileNumber) updateData.mobileNumber = mobileNumber;

  // update user
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  });

  // check if user was found and update
  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  // return the updated user details
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

// @desc     delete user by Id from db (soft-delete)
// route     POST api/v1/users/{id}
// @accesss  Private
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // validate the userId
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Delete the user (soft delete)
  const user = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // return success message
  return res
    .status(200)
    .json(new ApiResponse(200, "", "User deleted successfully"));
});

export { getAllUsers, getUserById, updateUser, deleteUser };

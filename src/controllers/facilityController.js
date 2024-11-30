import mongoose, { isValidObjectId } from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Facility } from "../models/facilityModel.js";
import { User } from "../models/userModel.js";

// @desc     create new facility (role based)
// route     POST api/v1/facility/createFacility
// @accesss  Private
const createFacility = asyncHandler(async (req, res) => {
  const { name, address, type } = req.body;

  // validate user role
  const allowedRoles = ["SuperAdmin", "DistrictAdmin", "FacilityAdmin"];
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, "You are not authorized to create a facility");
  }

  // validate required fields
  if (
    !name ||
    !address?.state ||
    !address?.city ||
    !address?.pincode ||
    !type
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Create the facility
  const facility = await Facility.create({
    name,
    address,
    type,
  });

  // Respond with the created facility
  return res
    .status(201)
    .json(new ApiResponse(201, facility, "Facility created successfully"));
});

// @desc     fetch all facility from db (role based fetching)
// route     GET api/v1/facility/getAllFacility
// @accesss  Private
const getFacility = asyncHandler(async (req, res) => {
  try {
    // fetch the role of the requesting user
    const requestingUser = await User.findById(req.user._id);
    if (!requestingUser) {
      throw new ApiError(404, "Requesting user not found");
    }

    let roleFilter = {};

    if (requestingUser.role === "DepartmentUser") {
      throw new ApiError(401, "Unauthorized to access the resource");
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
      .json(new ApiResponse(200, "Facilities fetched successfully", users));
  } catch (error) {
    throw new ApiError(500, "An error occurred while fetching facilities");
  }
});

// @desc     fetch a facility by Id from db
// route     GET api/v1/facility/{id}
// @accesss  Private
const getFacilityById = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;

  // validate facilityId parameter
  if (!isValidObjectId(facilityId)) {
    throw new ApiError(400, "Invalid facility ID");
  }

  // find the facility by ID
  const facility = await Facility.findById(facilityId);

  //check if the facility was found
  if (!facility) {
    throw new ApiError(404, "facility not found");
  }

  // return the user details
  return res
    .status(200)
    .json(new ApiResponse(200, facility, "Facility fetched successfully"));
});

// @desc     update facility by Id from db (role based)
// route     PATCH api/v1/facility/{id}
// @accesss  Private
const updateFacility = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const { name, address, type } = req.body;

  // validate facility
  if (!isValidObjectId(facilityId)) {
    throw new ApiError(400, "Invalid facility ID");
  }
});

// @desc     delete facility by Id from db (soft-delete & role based)
// route     POST api/v1/facility/{id}
// @accesss  Private
const deleteFacility = asyncHandler(async (req, res) => {});

export {
  createFacility,
  getFacility,
  getFacilityById,
  updateFacility,
  deleteFacility,
};

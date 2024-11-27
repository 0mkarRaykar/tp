import mongoose, { isValidObjectId } from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Facility } from "../models/facilityModel.js";

// @desc     create new facility (role based)
// route     POST api/v1/facility/createFacility
// @accesss  Private
const createFacility = asyncHandler(async (req, res) => {});

// @desc     fetch all facility from db (role based fetching)
// route     GET api/v1/facility/getAllFacility
// @accesss  Private
const getFacility = asyncHandler(async (req, res) => {});

// @desc     update facility by Id from db (role based)
// route     PATCH api/v1/facility/{id}
// @accesss  Private
const updateFacility = asyncHandler(async (req, res) => {});

// @desc     delete facility by Id from db (soft-delete & role based)
// route     POST api/v1/facility/{id}
// @accesss  Private
const deleteFacility = asyncHandler(async (req, res) => {});

export { createFacility, getFacility, updateFacility, deleteFacility }

import mongoose, { Schema } from "mongoose";

const FacilitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },
    type: {
      type: String,
      enum: ["Hospital", "Clinic", "Health Center"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Facility = mongoose.model("facility", FacilitySchema);

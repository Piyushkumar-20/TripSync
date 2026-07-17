import Trip from "./trip.model.js";
import Member from "../members/tripMembers.model.js";
import ApiError from "../../common/utils/api-error.js";
import crypto from "crypto";

const createTrip = async ({
  title,
  description,
  startDate,
  endDate,
  owner,
}) => {
  const existing = await Trip.findOne({ title, owner });
  if (existing) throw ApiError.conflict("Trip with this title already exists");
  return await Trip.create({ title, description, startDate, endDate, owner });
};

const getAllTrip = async ({ userId }) => {
  const memberTripIds = await Member.distinct("tripId", { userId });
  return await Trip.find({
    $or: [{ owner: userId }, { _id: { $in: memberTripIds } }],
  }).populate("owner", "fullName email");
};

const updateTrip = async ({ tripId, updates }) => {
  if (updates.title) {
    const current = await Trip.findById(tripId);
    if (current && updates.title !== current.title) {
      const conflict = await Trip.findOne({
        title: updates.title,
        owner: current.owner,
      });
      if (conflict)
        throw ApiError.conflict("Trip with this title already exists");
    }
  }

  const trip = await Trip.findByIdAndUpdate(tripId, updates, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!trip) throw ApiError.notFound("Trip Not Found!");
  return trip;
};

const deleteTrip = async (tripId) => {
  const trip = await Trip.findByIdAndDelete(tripId);
  if (!trip) throw ApiError.notFound("Trip Not Found!");
  return trip;
};

const generateShareLink = async ({ tripId, userId }) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw ApiError.notFound("Trip Not Found!");

  if (trip.shareLink?.isEnabled && trip.shareLink?.token) {
    return {
      shareLink: `${process.env.CLIENT_URL}/invite/${trip.shareLink.token}`,
    };
  }

  const token = crypto.randomBytes(32).toString("hex");

  trip.shareLink = {
    token,
    role: "viewer",
    isEnabled: true,
    expiresAt: null,
  };

  await trip.save();

  return {
    shareLink: `${process.env.CLIENT_URL}/invite/${token}`,
  };
};

export { createTrip, getAllTrip, updateTrip, deleteTrip, generateShareLink };

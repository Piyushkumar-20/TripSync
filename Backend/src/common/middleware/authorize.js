import Trip from "../../modules/trips/trip.model.js";
import Member from "../../modules/members/tripMembers.model.js";
import ApiError from "../utils/api-error.js";

/**
 * Loads the current user's role for the trip identified by req.params.tripId.
 * Attaches req.tripRole ("Owner" | "Editor" | "Viewer") and req.trip to the request.
 * Must run after `authenticate`.
 */
export const loadTripRole = async (req, res, next) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  const trip = await Trip.findById(tripId);
  if (!trip) throw ApiError.notFound("Trip not found");

  if (trip.owner.toString() === userId) {
    req.trip = trip;
    req.tripRole = "Owner";
    return next();
  }

  const member = await Member.findOne({ tripId, userId });
  if (!member) throw ApiError.forbidden("You don't have access to this trip");

  req.trip = trip;
  req.tripRole = member.role;
  next();
};

/**
 * Middleware factory. Throws 403 if req.tripRole is not in the allowed list.
 * Must run after loadTripRole.
 *
 * Usage: requireRole("Owner")
 *        requireRole("Owner", "Editor")
 */
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.tripRole)) {
      throw ApiError.forbidden(
        `Only ${roles.join(" or ")} can perform this action`,
      );
    }
    next();
  };

import Trip from "../../modules/trips/trip.model.js";
import Member from "../../modules/members/tripMembers.model.js";
import TripInvitation from "../../modules/members/tripInvitation.model.js";
import ApiError from "../utils/api-error.js";
import {
  ensureFreeSubscription,
  normalizeExpiredSubscription,
} from "../../modules/subscription/subscription.service.js";

/**
 * Allows only Pro users.
 * Used for premium features like Share via Link.
 */
 const requirePro = async (req, res, next) => {
  let ownerId = req.user.id;

  if (req.params.tripId) {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      throw ApiError.notFound("Trip not found");
    }

    ownerId = trip.owner.toString();
  }

  const subscription = await normalizeExpiredSubscription(
    await ensureFreeSubscription(ownerId),
  );

  if (
    subscription.plan !== "Pro" ||
    subscription.status !== "Active" ||
    (subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd < new Date())
  ) {
    throw ApiError.forbidden(
      "This feature is available only for Pro users.",
    );
  }

  next();
};

/**
 * Free plan can create only 3 trips.
 */
 const checkTripLimit = async (req, res, next) => {
  const subscription = await normalizeExpiredSubscription(
    await ensureFreeSubscription(req.user.id),
  );

  if (subscription.plan === "Pro") {
    return next();
  }

  const tripCount = await Trip.countDocuments({
    owner: req.user.id,
  });

  if (tripCount >= 3) {
    throw ApiError.forbidden(
      "Free plan allows only 3 trips. Upgrade to Pro.",
    );
  }

  next();
};

/**
 * Free plan can have only 5 members per trip.
 */
const checkMemberLimit = async (req, res, next) => {
  const trip = await Trip.findById(req.params.tripId);

  if (!trip) {
    throw ApiError.notFound("Trip not found");
  }

  const subscription = await normalizeExpiredSubscription(
    await ensureFreeSubscription(trip.owner),
  );

  if (subscription.plan === "Pro") {
    return next();
  }

  const [memberCount, pendingInviteCount] = await Promise.all([
    Member.countDocuments({
      tripId: req.params.tripId,
    }),
    TripInvitation.countDocuments({
      tripId: req.params.tripId,
      status: "Pending",
      expiresAt: { $gt: new Date() },
    }),
  ]);

  if (memberCount + pendingInviteCount >= 5) {
    throw ApiError.forbidden(
      "Free plan allows only 5 members or pending invites per trip. Upgrade to Pro.",
    );
  }

  next();
};

export {requirePro, checkTripLimit, checkMemberLimit}

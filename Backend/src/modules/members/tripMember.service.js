import Member from "./tripMembers.model.js";
import TripInvitation from "./tripInvitation.model.js";
import User from "../users/user.model.js";
import Trip from "../trips/trip.model.js";
import ApiError from "../../common/utils/api-error.js";
import { io } from "../../app.js";
import {
  sendMemberAddedEmail,
  sendTripInvitationEmail,
} from "../../common/config/email.js";
import crypto from "crypto";
import {
  ensureFreeSubscription,
  normalizeExpiredSubscription,
} from "../subscription/subscription.service.js";

const addMember = async ({ tripId, email, role, currentUserId }) => {
  const [user, trip, inviter] = await Promise.all([
    User.findOne({ email }),
    Trip.findById(tripId),
    User.findById(currentUserId),
  ]);

  if (!user) throw ApiError.notFound("User not found!");

  const existing = await Member.findOne({ tripId, userId: user._id });
  if (existing) throw ApiError.conflict("User is already a member of this trip");

  const member = await Member.create({ tripId, userId: user._id, role });
  io.to(`trip_${tripId}`).emit("member:added", member);

  if (trip && inviter) {
    sendMemberAddedEmail(user.email, user.fullName, trip.title, inviter.fullName).catch(() => {});
  }

  return member;
};

const createInvitation = async ({ tripId, email, role, currentUserId }) => {
  const [trip, inviter, invitedUser] = await Promise.all([
    Trip.findById(tripId),
    User.findById(currentUserId),
    User.findOne({ email }),
  ]);

  if (!trip) throw ApiError.notFound("Trip not found!");
  if (!inviter) throw ApiError.unauthorized("Please log in again.");

  if (invitedUser) {
    const existing = await Member.findOne({ tripId, userId: invitedUser._id });
    if (existing) throw ApiError.conflict("This person is already a member of this trip.");
  }

  const subscription = await normalizeExpiredSubscription(
    await ensureFreeSubscription(trip.owner),
  );

  if (subscription.plan !== "Pro") {
    const [memberCount, pendingInviteCount] = await Promise.all([
      Member.countDocuments({ tripId }),
      TripInvitation.countDocuments({
        tripId,
        status: "Pending",
        expiresAt: { $gt: new Date() },
      }),
    ]);

    if (memberCount + pendingInviteCount >= 5) {
      throw ApiError.forbidden("Free plan allows only 5 members or pending invites per trip. Upgrade to Pro.");
    }
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await TripInvitation.findOneAndUpdate(
    {
      tripId,
      invitedEmail: email,
      status: "Pending",
    },
    {
      tripId,
      invitedEmail: email,
      invitedBy: currentUserId,
      role,
      token,
      status: "Pending",
      expiresAt,
      acceptedBy: null,
      acceptedAt: null,
    },
    { upsert: true, runValidators: true },
  );

  const invitationUrl = `${process.env.CLIENT_URL}/invitations/${token}`;

  try {
    await sendTripInvitationEmail({
      toEmail: email,
      tripTitle: trip.title,
      inviterName: inviter.fullName,
      role,
      invitationUrl,
    });
  } catch {
    await TripInvitation.deleteOne({ token });
    throw ApiError.badGateway("Unable to send invitation email. Please try again later.");
  }

  return {
    email,
    role,
    expiresAt,
  };
};

const getInvitationByToken = async ({ token }) => {
  const invitation = await TripInvitation.findOne({ token })
    .populate("tripId", "title description startDate endDate owner")
    .populate("invitedBy", "fullName email")
    .lean();

  if (!invitation) throw ApiError.notFound("Invitation not found.");

  if (invitation.status !== "Pending") {
    throw ApiError.badRequest("This invitation is no longer active.");
  }

  if (invitation.expiresAt < new Date()) {
    await TripInvitation.updateOne({ _id: invitation._id }, { status: "Expired" });
    throw ApiError.badRequest("This invitation has expired.");
  }

  return {
    token: invitation.token,
    email: invitation.invitedEmail,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    trip: invitation.tripId,
    invitedBy: invitation.invitedBy,
  };
};

const acceptInvitation = async ({ token, userId }) => {
  const [invitation, user] = await Promise.all([
    TripInvitation.findOne({ token }),
    User.findById(userId),
  ]);

  if (!invitation) throw ApiError.notFound("Invitation not found.");
  if (!user) throw ApiError.unauthorized("Please log in again.");

  if (invitation.status !== "Pending") {
    throw ApiError.badRequest("This invitation is no longer active.");
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = "Expired";
    await invitation.save();
    throw ApiError.badRequest("This invitation has expired.");
  }

  if (user.email.toLowerCase() !== invitation.invitedEmail) {
    throw ApiError.forbidden("Please log in with the email address that received this invitation.");
  }

  const existingMember = await Member.findOne({
    tripId: invitation.tripId,
    userId,
  });

  if (!existingMember) {
    const trip = await Trip.findById(invitation.tripId);
    if (!trip) throw ApiError.notFound("Trip not found!");

    const subscription = await normalizeExpiredSubscription(
      await ensureFreeSubscription(trip.owner),
    );

    if (subscription.plan !== "Pro") {
      const memberCount = await Member.countDocuments({ tripId: invitation.tripId });
      if (memberCount >= 5) {
        throw ApiError.forbidden("Free plan allows only 5 members per trip. Upgrade to Pro.");
      }
    }

    const member = await Member.create({
      tripId: invitation.tripId,
      userId,
      role: invitation.role,
    });
    io.to(`trip_${invitation.tripId}`).emit("member:added", member);
  }

  invitation.status = "Accepted";
  invitation.acceptedBy = userId;
  invitation.acceptedAt = new Date();
  await invitation.save();

  return {
    tripId: invitation.tripId,
    role: invitation.role,
  };
};

const getAllMember = async ({ tripId }) => {
  return await Member.find({ tripId }).populate("userId", "fullName email");
};

const getMemberById = async ({ tripId, memberId }) => {
  const member = await Member.findOne({ tripId, _id: memberId }).populate(
    "userId",
    "fullName email",
  );
  if (!member) throw ApiError.notFound("Member not found!");
  return member;
};

const updateMember = async ({ tripId, memberId, role }) => {
  const member = await Member.findOneAndUpdate(
    { _id: memberId, tripId },
    { role },
    { returnDocument: 'after', runValidators: true },
  );
  if (!member) throw ApiError.notFound("Member not found!");
  io.to(`trip_${tripId}`).emit("member:updated", member);
  return member;
};

const deleteMember = async ({ tripId, memberId }) => {
  const member = await Member.findOneAndDelete({ _id: memberId, tripId });
  if (!member) throw ApiError.notFound("Member not found!");
  io.to(`trip_${tripId}`).emit("member:deleted", { memberId });
  return member;
};

export {
  addMember,
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  getAllMember,
  getMemberById,
  updateMember,
  deleteMember,
};

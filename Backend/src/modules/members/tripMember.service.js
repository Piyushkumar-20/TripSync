import Member from "./tripMembers.model.js";
import User from "../users/user.model.js";
import Trip from "../trips/trip.model.js";
import ApiError from "../../common/utils/api-error.js";
import { io } from "../../app.js";
import { sendMemberAddedEmail } from "../../common/config/email.js";

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

export { addMember, getAllMember, getMemberById, updateMember, deleteMember };

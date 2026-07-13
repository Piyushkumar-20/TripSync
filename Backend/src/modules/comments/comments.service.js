import ApiError from "../../common/utils/api-error.js";
import Activity from "../activity/activity.model.js";
import Destination from "../destination/destination.model.js";
import Comment from "../comments/comments.model.js";
import { io } from "../../app.js"

const createComment = async ({ activityId, content, currentUserId }) => {
  const activity = await Activity.findById(activityId);
  if (!activity) {
    throw ApiError.notFound("Activity Not found");
  }

  const destination = await Destination.findById(activity.destinationId);
  if (!destination) {
    throw ApiError.notFound("Destination Not Found!");
  }

  const comment = await Comment.create({
    tripId: destination.tripId,
    activityId,
    content,
    userId: currentUserId,
  });

  const populated = await comment.populate("userId", "fullName email");
  io.to(`trip_${destination.tripId}`).emit("comment:created", populated);
  return populated;
};

const getAllComment = async ({ activityId }) => {
  return await Comment.find({ activityId }).populate(
    "userId",
    "fullName email",
  );
};

const createTripComment = async ({ tripId, content, currentUserId }) => {
  const comment = await Comment.create({
    tripId,
    content,
    userId: currentUserId,
  });

  const populated = await comment.populate("userId", "fullName email");
  io.to(`trip_${tripId}`).emit("comment:created", populated);
  return populated;
};

const getTripComments = async ({ tripId }) => {
  return await Comment.find({
    tripId,
    $or: [{ activityId: { $exists: false } }, { activityId: null }],
  })
    .populate("userId", "fullName email")
    .sort({ createdAt: 1 });
};

const updateComment = async ({ commentId, content }) => {
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { returnDocument: 'after', runValidators: true },
  ).populate("userId", "fullName email");

  if (!comment) {
    throw ApiError.notFound("Comment Not Found!");
  }
  io.to(`trip_${comment.tripId}`).emit("comment:updated", comment);
  return comment;
};

const deleteComment = async ({ commentId, tripId }) => {
  const comment = await Comment.findOneAndDelete({
    _id: commentId,
  });

  if (!comment) {
    throw ApiError.notFound("Comment not found!");
  }

  io.to(`trip_${tripId}`).emit("comment:deleted", {
    commentId,
  });

  return comment;
};

export {
  createComment,
  getAllComment,
  createTripComment,
  getTripComments,
  updateComment,
  deleteComment,
};

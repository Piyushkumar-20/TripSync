import * as commentService from "./comments.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const createComment = async (req, res) => {
  const comment = await commentService.createComment({
    ...req.body,
    activityId: req.params.activityId,
    currentUserId: req.user.id,
  });
  ApiResponse.created(res, "Comment Added", comment);
};

const createTripComment = async (req, res) => {
  const comment = await commentService.createTripComment({
    ...req.body,
    tripId: req.params.tripId,
    currentUserId: req.user.id,
  });
  ApiResponse.created(res, "Comment Added", comment);
};

const updateComment = async (req, res) => {
  const comment = await commentService.updateComment({
    ...req.body,
    commentId: req.params.commentId,
  });
  ApiResponse.ok(res, "Comment Updated", comment);
};

const getAllComment = async (req, res) => {
  const comment = await commentService.getAllComment({
    activityId: req.params.activityId,
  });
  ApiResponse.ok(res, "Comments!", comment);
};

const getTripComments = async (req, res) => {
  const comments = await commentService.getTripComments({
    tripId: req.params.tripId,
  });
  ApiResponse.ok(res, "Comments!", comments);
};

const deleteComment = async (req, res) => {
  await commentService.deleteComment({
    tripId: req.params.tripId,
    commentId: req.params.commentId,
  });
  ApiResponse.noContent(res, "Comment Removed Successfully!");
};

export {
  createComment,
  createTripComment,
  updateComment,
  getAllComment,
  getTripComments,
  deleteComment,
};

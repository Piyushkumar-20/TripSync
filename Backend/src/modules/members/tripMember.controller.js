import * as memberService from "./tripMember.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const addMember = async (req, res) => {
  const member = await memberService.addMember({
    ...req.body,
    tripId: req.params.tripId,
    currentUserId: req.user.id,
  });
  ApiResponse.created(res, "Member added successfully!", member);
};

const createInvitation = async (req, res) => {
  const invitation = await memberService.createInvitation({
    ...req.body,
    tripId: req.params.tripId,
    currentUserId: req.user.id,
  });

  ApiResponse.created(res, "Invitation email sent successfully!", invitation);
};

const getInvitationByToken = async (req, res) => {
  const invitation = await memberService.getInvitationByToken({
    token: req.params.token,
  });

  ApiResponse.ok(res, "Invitation fetched successfully.", invitation);
};

const acceptInvitation = async (req, res) => {
  const invitation = await memberService.acceptInvitation({
    token: req.params.token,
    userId: req.user.id,
  });

  ApiResponse.created(res, "Invitation accepted successfully.", invitation);
};

const getAllMember = async (req, res) => {
  const members = await memberService.getAllMember({ tripId: req.params.tripId });
  ApiResponse.ok(res, "Members of this Trip", members);
};

const getMemberById = async (req, res) => {
  const member = await memberService.getMemberById({
    tripId: req.params.tripId,
    memberId: req.params.memberId,
  });
  ApiResponse.ok(res, "Trip Member", member);
};

const updateMember = async (req, res) => {
  const member = await memberService.updateMember({
    ...req.body,
    tripId: req.params.tripId,
    memberId: req.params.memberId,
  });
  ApiResponse.ok(res, "Member Updated Successfully!", member);
};

const deleteMember = async (req, res) => {
  await memberService.deleteMember({
    tripId: req.params.tripId,
    memberId: req.params.memberId,
  });
  ApiResponse.ok(res, "Member Removed Successfully!");
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

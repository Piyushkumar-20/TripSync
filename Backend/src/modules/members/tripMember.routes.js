import { Router } from "express";
import validate from "../../common/validators/validator.js";
import authenticate from "../auth/auth.middleware.js";
import {
  loadTripRole,
  requireRole,
} from "../../common/middleware/authorize.js";
import * as controller from "./tripMember.controller.js";
import AddMemberDto from "./dto/add-member.dto.js";
import UpdateMemberRoleDto from "./dto/update-member-role.dto.js";
import checkMemberLimit from "../../common/middleware/subscription.middleware.js";

const router = Router();

// Any trip member can view the member list
router.get(
  "/:tripId/members",
  authenticate,
  loadTripRole,
  controller.getAllMember,
);
router.get(
  "/:tripId/members/:memberId",
  authenticate,
  loadTripRole,
  controller.getMemberById,
);

// Only the trip owner can manage members
router.post(
  "/:tripId/members",
  authenticate,
  loadTripRole,
  requireRole("Owner"),
  checkMemberLimit,
  validate(AddMemberDto),
  controller.addMember,
);

router.patch(
  "/:tripId/members/:memberId",
  authenticate,
  loadTripRole,
  requireRole("Owner"),
  validate(UpdateMemberRoleDto),
  controller.updateMember,
);

router.delete(
  "/:tripId/members/:memberId",
  authenticate,
  loadTripRole,
  requireRole("Owner"),
  controller.deleteMember,
);

export default router;

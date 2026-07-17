import { Router } from "express";
import validate from "../../common/validators/validator.js";
import authenticate from "../auth/auth.middleware.js";
import {
  loadTripRole,
  requireRole,
} from "../../common/middleware/authorize.js";
import * as controller from "./trip.controller.js";
import CreateTripDto from "./dto/create-trip.dto.js";
import { upload } from "../../common/middleware/upload.js";

const router = Router();

router.post(
  "/create-trip",
  authenticate,
  validate(CreateTripDto),
  controller.createTrip,
);
router.get("/getAllTrips", authenticate, controller.getAlltrip);

router.patch(
  "/:tripId",
  authenticate,
  loadTripRole,
  requireRole("Owner", "Editor"),
  controller.updateTrip,
);

router.delete(
  "/:tripId",
  authenticate,
  loadTripRole,
  requireRole("Owner"),
  controller.deletetrip,
);

router.post(
  "/:tripId/share-link",
  authenticate,
  loadTripRole,
  requireRole("Owner"),
  controller.generateShareLink,
);

router.patch(
  "/:tripId/cover",
  upload.single("cover"),
  authenticate,
  loadTripRole,
  requireRole("Owner", "Editor"),
  controller.uploadCover,
);

export default router;

import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import { apiReference } from "@scalar/express-api-reference";
import openApiSpec from "./common/docs/openapi.js";
import ApiError from "./common/utils/api-error.js";
import { getAllowedOrigins } from "./common/config/env.js";
import { logger, requestContext } from "./common/utils/logger.js";

import authRoute from "./modules/auth/auth.routes.js";
import tripRoute from "./modules/trips/trip.routes.js";
import tripMemberRoute from "./modules/members/tripMember.routes.js";
import destinationRoute from "./modules/destination/destination.routes.js";
import expenseRoute from "./modules/expenses/expense.routes.js";
import documentRoute from "./modules/documents/document.routes.js";
import activityRoute from "./modules/activity/activity.routes.js";
import commentRoute from "./modules/comments/comment.routes.js";
import checklistRoute from "./modules/checklists/checklistItem.routes.js";
import subscriptionRoute from "./modules/subscription/subscription.routes.js"


const app = express();


const allowedOrigins = getAllowedOrigins();

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = origin?.replace(/\/$/, "");
    if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    callback(ApiError.forbidden("Origin is not allowed by CORS."));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(compression());
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api-docs/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

app.get(
  "/api-docs",
  apiReference({
    url: "/api-docs/openapi.json",
    pageTitle: "TripSync API Reference",
  }),
);


const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/trips", tripRoute);
app.use("/api/v1/trips", tripMemberRoute);
app.use("/api/v1/trips", destinationRoute);
app.use("/api/v1/trips", expenseRoute);
app.use("/api/v1/trips", documentRoute);
app.use("/api/v1/trips", activityRoute);
app.use("/api/v1/trips", commentRoute);
app.use("/api/v1/trips/checklists", checklistRoute);
app.use("/api/v1/subscriptions", subscriptionRoute);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const error = err.code || err.name || "Error";
  const details = err.details || null;

  logger.error("Request failed.", {
    ...requestContext(req),
    statusCode: status,
    error,
    message,
    details,
    stack: err.stack,
  });

  res.status(status).json({
    success: false,
    message,
    error,
    details,
    statusCode: status,
  });
});

export { app, server, io };

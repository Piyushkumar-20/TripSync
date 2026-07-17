import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import { apiReference } from "@scalar/express-api-reference";

import authRoute from "./modules/auth/auth.routes.js";
import tripRoute from "./modules/trips/trip.routes.js";
import tripMemberRoute from "./modules/members/tripMember.routes.js";
import destinationRoute from "./modules/destination/destination.routes.js";
import expenseRoute from "./modules/expenses/expense.routes.js";
import documentRoute from "./modules/documents/document.routes.js";
import activityRoute from "./modules/activity/activity.routes.js";
import commentRoute from "./modules/comments/comment.routes.js";
import checklistRoute from "./modules/checklists/checklistItem.routes.js";
import openApiSpec from "./common/docs/openapi.js";

const app = express();


const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(compression());
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(cors(corsOptions));
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


app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ success: false, message });
});

export { app, server, io };

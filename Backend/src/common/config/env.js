import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const REQUIRED_ENV_VARS = [
  "NODE_ENV",
  "CLIENT_URL",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

const getEnv = (name) => process.env[name]?.trim();

const splitOrigins = (value) =>
  (value || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

const getAllowedOrigins = () => [
  ...new Set([
    ...splitOrigins(getEnv("CLIENT_URL")),
    ...splitOrigins(getEnv("FRONTEND_URL")),
  ]),
];

const validateEnvironment = () => {
  const missing = REQUIRED_ENV_VARS.filter((name) => !getEnv(name));

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`,
    );
  }

  if (!["development", "production", "test"].includes(getEnv("NODE_ENV"))) {
    throw new Error(
      "NODE_ENV must be one of: development, production, test.",
    );
  }

  if (getAllowedOrigins().length === 0) {
    throw new Error("At least one frontend origin must be configured.");
  }
};

const env = {
  get nodeEnv() {
    return getEnv("NODE_ENV");
  },
  get isProduction() {
    return getEnv("NODE_ENV") === "production";
  },
  get razorpayKeyId() {
    return getEnv("RAZORPAY_KEY_ID");
  },
  get razorpayKeySecret() {
    return getEnv("RAZORPAY_KEY_SECRET");
  },
  get allowedOrigins() {
    return getAllowedOrigins();
  },
};

export { env, getAllowedOrigins, validateEnvironment };

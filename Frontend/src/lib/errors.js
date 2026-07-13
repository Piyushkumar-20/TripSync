const IS_DEV = import.meta.env.DEV;

export const ERROR_MESSAGES = {
  generic: "Something went wrong. Please try again.",
  load: "Unable to load data.",
  network: "Network error. Please check your internet connection.",
  unauthorized: "You are not authorized to perform this action.",
  sessionExpired: "Session expired. Please log in again.",
  notFound: "Resource not found.",
  timeout: "The request timed out. Please try again.",
};

const RAW_ERROR_PATTERN =
  /(TypeError|ReferenceError|SyntaxError|RangeError|AxiosError|Mongo|CastError|ValidationError|E11000|ECONNREFUSED|ERR_NETWORK|stack trace|at\s+\w+\s*\(|Internal Server Error)/i;

const SAFE_MESSAGE_STATUSES = new Set([400, 409, 422]);

function isNetworkError(error) {
  if (error?.response) return false;
  return (
    error?.code === "ERR_NETWORK" ||
    error?.message === "Network Error" ||
    !navigator.onLine
  );
}

function isTimeoutError(error) {
  return error?.code === "ECONNABORTED" || /timeout/i.test(error?.message ?? "");
}

export function isSafeUserMessage(message) {
  if (typeof message !== "string") return false;

  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 200) return false;

  return !RAW_ERROR_PATTERN.test(trimmed);
}

export function logError(error, context) {
  if (!IS_DEV || !error) return;

  if (context) {
    console.error(`[${context}]`, error);
    return;
  }

  console.error(error);
}

export function getUserErrorMessage(error, fallback = ERROR_MESSAGES.generic) {
  if (!error) return fallback;

  if (isNetworkError(error)) return ERROR_MESSAGES.network;
  if (isTimeoutError(error)) return ERROR_MESSAGES.timeout;

  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message;

  if (status === 401) return ERROR_MESSAGES.sessionExpired;
  if (status === 403) return ERROR_MESSAGES.unauthorized;
  if (status === 404) return ERROR_MESSAGES.notFound;

  if (SAFE_MESSAGE_STATUSES.has(status) && isSafeUserMessage(backendMessage)) {
    return backendMessage;
  }

  logError(error);
  return fallback;
}

export function getLoadErrorMessage(error) {
  return getUserErrorMessage(error, ERROR_MESSAGES.load);
}

export function getAuthErrorMessage(
  error,
  fallback = "Login failed. Please check your credentials.",
) {
  if (!error) return fallback;

  if (isNetworkError(error)) return ERROR_MESSAGES.network;
  if (isTimeoutError(error)) return ERROR_MESSAGES.timeout;

  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message;

  if ([400, 401, 409, 422].includes(status) && isSafeUserMessage(backendMessage)) {
    return backendMessage;
  }

  if (status === 401) return "Invalid email or password.";

  logError(error, "auth");
  return fallback;
}

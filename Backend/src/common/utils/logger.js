const REDACTED = "[redacted]";

const shouldRedact = (key) =>
  /password|token|secret|authorization|cookie|signature|key/i.test(key);

const sanitizeForLog = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        shouldRedact(key) ? REDACTED : sanitizeForLog(item),
      ]),
    );
  }

  return value;
};

const requestContext = (req) => ({
  endpoint: `${req.method} ${req.originalUrl}`,
  userId: req.user?.id || null,
  requestBody: sanitizeForLog(req.body),
});

const logger = {
  info(message, meta = {}) {
    console.info(
      JSON.stringify({
        level: "info",
        message,
        ...sanitizeForLog(meta),
      }),
    );
  },

  error(message, meta = {}) {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        ...sanitizeForLog(meta),
      }),
    );
  },
};

export { logger, requestContext, sanitizeForLog };

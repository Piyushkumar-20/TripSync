import { validateEnvironment } from "./common/config/env.js";
import { logger } from "./common/utils/logger.js";

validateEnvironment();

const [{ connectionDB }, { server }, { initSocket }] = await Promise.all([
  import("./common/config/db.js"),
  import("./app.js"),
  import("./socket/socket.js"),
]);

const PORT = process.env.PORT || 8080;
const startServer = async () => {
  await connectionDB();
  const { ensurePaymentIndexes } = await import(
    "./modules/subscription/payment_history.model.js"
  );

  await ensurePaymentIndexes();

  initSocket();

  server.listen(PORT, () => {
    logger.info("Server started.", { port: PORT, nodeEnv: process.env.NODE_ENV });
  });
};

startServer().catch((error) => {
  logger.error("Server failed to start.", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

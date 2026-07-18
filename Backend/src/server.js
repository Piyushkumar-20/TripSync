import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {connectionDB} from "./common/config/db.js";
import { server } from "./app.js"
import { initSocket } from "./socket/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 8080;
const startServer = async () => {
  await connectionDB();

  initSocket();

  server.listen(PORT);
};

startServer().catch(() => {
  process.exit(1);
});

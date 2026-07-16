import "dotenv/config";
import {connectionDB} from "./common/config/db.js";
import { server } from "./app.js"
import { initSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 8080;
const startServer = async () => {
  await connectionDB();

  initSocket();

  server.listen(PORT);
};

startServer().catch(() => {
  process.exit(1);
});

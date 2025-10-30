import "dotenv/config";
import app from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { ensureUploadDirs } from "./config/dirs";

const PORT = Number(process.env.PORT);

(async () => {
  await ensureUploadDirs();
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const gracefulShutdown = async () => {
    console.log("Shutdown signal received");
    server.close(async () => {
      await disconnectDB();
      console.log("Server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
})();

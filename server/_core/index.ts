import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerRewardWebhook } from "../rewardWebhook";
import { registerRestRoutes } from "../rest";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => server.close(() => resolve(true)));
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Preserve exact raw bodies for HMAC verification before JSON parsing.
  app.post("/api/webhooks/rewarded-ad", express.raw({ type: "application/json", limit: "1mb" }));
  app.post("/api/payments/payoneer/webhook", express.raw({ type: "application/json", limit: "1mb" }));
  app.use(express.json({ limit: "12mb" }));
  app.use(express.urlencoded({ limit: "12mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerRewardWebhook(app);
  registerRestRoutes(app);

  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (process.env.NODE_ENV === "development") await setupVite(app, server);
  else serveStatic(app);

  const PORT = 3000;
  server.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${PORT}/`));
}

startServer().catch(console.error);

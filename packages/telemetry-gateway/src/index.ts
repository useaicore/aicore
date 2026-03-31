import { Hono } from "hono";
import { registerTelemetryRoutes } from "./routes/telemetry.js";

const app = new Hono();

// Wires up the telemetry ingestion routes
registerTelemetryRoutes(app);

export default app;

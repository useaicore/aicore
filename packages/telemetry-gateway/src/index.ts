import { Hono } from "hono";
import pkg from "pg";
const { Pool } = pkg;
import { registerTelemetryRoutes } from "./routes/telemetry.js";

const app = new Hono();

// Shared Postgres pool for telemetry ingestion
// 'max' and 'idleTimeoutMillis' help manage high-velocity best-effort telemetry calls.
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Wires up the telemetry ingestion routes
registerTelemetryRoutes(app, db);

export default app;

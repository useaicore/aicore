import { serve } from "@hono/node-server";
import app from "./index.js";

const port = Number(process.env.PORT ?? 3001);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`🚀 Telemetry Gateway started on port ${info.port}`);
  }
);

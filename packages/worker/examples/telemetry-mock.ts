import http from "node:http";
import fs from "node:fs";
import path from "node:path";

/**
 * AICore Telemetry Mock Gateway
 * 
 * listens on http://localhost:8080/v1/telemetry/usage
 * Logs usage metadata to console and optionally to a .jsonl file.
 */

const PORT = 8080;
const LOG_FILE = process.env.AICORE_USAGE_LOG_PATH || "../../logs/usage.jsonl";

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/v1/telemetry/usage") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        const timestamp = new Date().toISOString();

        console.log(`\n[📡 Telemetry] Received usage at ${timestamp}`);
        console.log(JSON.stringify(payload, null, 2));

        // Append to JSONL log file
        const logEntry = JSON.stringify({ timestamp, ...payload }) + "\n";
        const logPath = path.resolve(process.cwd(), LOG_FILE);
        
        // Ensure directory exists
        fs.mkdirSync(path.dirname(logPath), { recursive: true });
        fs.appendFileSync(logPath, logEntry);

        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error("❌ Failed to parse telemetry payload:", err);
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Telemetry Gateway Mock listening on http://localhost:${PORT}`);
  console.log(`📁 Logging usage to: ${path.resolve(process.cwd(), LOG_FILE)}`);
  console.log(`Waiting for usage from AICore Worker...`);
});

import { AICore } from "../index.js";

async function main() {
  const endpoint = process.env.WORKER_URL ?? "https://aicore-worker.useaicore.workers.dev";
  const apiKey = process.env.AICORE_API_KEY ?? "ak_live_d5065f1e7e1146e4924c3c1969500c0b";
  
  // Actually, we use x-aicore-key mapping to workspace_api_keys.
  // We need to pass the plaintext key.
  const ai = new AICore({
    endpoint,
    apiKey,
    terminalMetrics: true
  });

  console.log("===================================");
  console.log("🚀 Testing AICore End-to-End");
  console.log(`📡 Endpoint: ${endpoint}`);
  console.log("===================================");

  try {
    console.log("\n[1] Sending chat request...");
    const result = await ai.chat([
      { role: "user", content: "Say hello in one sentence." }
    ], {
      provider: "groq",
      model: "llama-3.1-8b-instant",
      feature: "chat",
      taskType: "generation",
      planTier: "free"
    });

    console.log("\n[2] Received response:");
    console.log(`    Content: ${result.content}`);
    console.log(`    Call ID: ${result.callId}`);
    console.log(`    Trace ID: ${result.traceId}`);
    console.log(`    Usage: ${JSON.stringify(result.usage)}`);

    console.log("\n[3] Waiting 3000ms for Worker waitUntil telemetry write...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("\n[4] Querying Supabase usagelogs via REST API...");
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.warn("⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. Skipping Supabase verification.");
      process.exit(0);
    }

    if (!result.callId) {
      throw new Error("Worker response did not include a callId.");
    }

    const queryUrl = `${supabaseUrl}/rest/v1/usagelogs?call_id=eq.${result.callId}`;
    const verifyRes = await fetch(queryUrl, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Accept': 'application/json'
      }
    });

    if (!verifyRes.ok) {
      throw new Error(`Supabase query failed: ${verifyRes.status} ${verifyRes.statusText}`);
    }

    const rows = await verifyRes.json() as any[];

    if (rows.length === 0) {
      throw new Error(`❌ No telemetry row found in usagelogs for call_id: ${result.callId}`);
    }

    const log = rows[0];
    console.log("\n✅ Telemetry successfully verified in Supabase!");
    console.log(`    Logged workspace_id: ${log.workspace_id}`);
    console.log(`    Logged total_tokens: ${log.total_tokens}`);
    console.log(`    Logged feature: ${log.feature}`);

    console.log("\n🎉 E2E Test Passed Successfully!");

  } catch (error) {
    console.error("\n❌ E2E Test Failed:");
    console.error(error);
    process.exit(1);
  }
}

main();

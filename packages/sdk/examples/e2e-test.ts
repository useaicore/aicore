import { AICore } from "../src/index.js";
import type { ChatMessage, ChatOptions } from "../src/index.js";

/**
 * AICore SDK — End-to-End Test Script
 * 
 * To run this:
 * 1. Ensure your Worker is running (e.g., `npx wrangler dev` in packages/worker).
 * 2. Set the environment variables below or use a .env file.
 * 3. Run: `npx tsx examples/e2e-test.ts`
 */

async function main() {
  const sdk = new AICore({
    endpoint: process.env.AICORE_ENDPOINT || "http://localhost:8787",
    workspaceId: process.env.AICORE_WORKSPACE_ID || "test-workspace",
    workspaceKey: process.env.AICORE_WORKSPACE_KEY || "sk_test_key", // Must match Worker's WORKSPACE_KEY
    terminalMetrics: true, // Print usage stats to console automatically
  });

  const messages: ChatMessage[] = [
    { role: "user", content: "Explain quantum entanglement in one sentence." }
  ];

  const options: ChatOptions = {
    provider: "openai", // Options: "openai", "anthropic", "gemini", "groq"
    model: "gpt-4o-mini",
    feature: "e2e-test",
    taskType: "generation",
    planTier: "free",
    shadowMode: true,
  };

  console.log("--- 🧪 Testing Unary Chat (ai.chat) ---");
  try {
    const response = await sdk.chat(messages, options);
    console.log("Response:", response.content);
    console.log("Usage:", JSON.stringify(response.usage, null, 2));
  } catch (err: any) {
    console.error("❌ Chat failed:", err.message);
    if (err.aicoreError) console.error("Details:", err.aicoreError);
  }

  console.log("\n--- 🧪 Testing Streaming (ai.stream) ---");
  try {
    const stream = sdk.stream(messages, { ...options, model: "gpt-4o" });
    process.stdout.write("Streaming: ");
    for await (const chunk of stream) {
      if (chunk.type === "text_delta") {
        process.stdout.write(chunk.delta);
      } else if (chunk.type === "usage") {
        console.log("\n\nStream Usage:", JSON.stringify(chunk, null, 2));
      }
    }
    console.log("\n✅ Stream complete.");
  } catch (err: any) {
    console.error("\n❌ Streaming failed:", err.message);
  }

  console.log("\n--- 🧪 Testing Wrapper (ai.complete) ---");
  try {
    const completion = await sdk.complete("What is 2+2?", options);
    console.log("Completion Result:", completion.text);
  } catch (err: any) {
    console.error("❌ Complete failed:", err.message);
  }
}

main().catch(console.error);

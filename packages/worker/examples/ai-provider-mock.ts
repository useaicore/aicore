import http from "node:http";

/**
 * Mock AI Provider for E2E Testing
 * 
 * listens on Port 9090
 * Simulates OpenAI, Anthropic, and Gemini endpoints.
 */

const PORT = 9090;

const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => {
    const url = req.url || "";
    console.log(`[🤖 AI Mock] Received request: ${req.method} ${url}`);

    res.setHeader("Content-Type", "application/json");

    // 1. OpenAI Chat Mock
    if (url.includes("/v1/chat/completions")) {
      const payload = JSON.parse(body);
      if (payload.stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "I am " } }] })}\n\n`);
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "an AI " } }] })}\n\n`);
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "mock." } }] })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        res.end();
      } else {
        res.end(JSON.stringify({
          id: "mock_123",
          object: "chat.completion",
          created: Date.now(),
          model: payload.model,
          choices: [{ message: { role: "assistant", content: "This is a mock response from OpenAI." } }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
        }));
      }
      return;
    }

    // 2. Anthropic Messages Mock
    if (url.includes("/v1/messages")) {
      // @ts-ignore
      const _payload = JSON.parse(body);
      res.end(JSON.stringify({
        id: "anth_123",
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: "This is a mock response from Anthropic." }],
        usage: { input_tokens: 15, output_tokens: 25 }
      }));
      return;
    }

    // 3. Gemini Mock
    if (url.includes("generateContent")) {
      res.end(JSON.stringify({
        candidates: [{ content: { parts: [{ text: "This is a mock response from Gemini." }] } }],
        usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 15 }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Endpoint not mocked" }));
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 AI Provider Mock listening on http://localhost:${PORT}`);
  console.log(`Ready to simulate OpenAI, Anthropic, and Gemini.`);
});

import type { ChatMessage, Logger } from "@aicore/types";

export class AICore {
  constructor(private logger: Logger) {}

  async chat(_messages: ChatMessage[]) {
    this.logger.info("Starting chat completion", { messageCount: _messages.length });
    // Implementation placeholder
    return { content: "AI response" };
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

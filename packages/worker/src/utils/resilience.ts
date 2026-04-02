/**
 * @module utils/resilience
 * 
 * Resilience patterns for the AICore Worker (Retry, Backoff).
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  multiplier?: number;
  jitter?: boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 10000,
  multiplier: 2,
  jitter: true,
};

/**
 * Executes a function with exponential backoff retries for transient errors.
 * Transient errors include 429 (Rate Limit) and 5xx (Server Error).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      // Determine if error is retryable
      const isRetryable = isTransientError(err);
      
      if (!isRetryable || attempt === opts.maxRetries) {
        throw err;
      }

      // Calculate delay
      let delay = opts.baseDelayMs * Math.pow(opts.multiplier, attempt);
      if (opts.jitter) {
        delay = delay * (0.5 + Math.random());
      }
      delay = Math.min(delay, opts.maxDelayMs);

      console.warn(`[Resilience] Attempt ${attempt + 1} failed. Retrying in ${Math.round(delay)}ms... Error: ${err.message}`);
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Determines if an error is transient and should be retried.
 */
function isTransientError(err: any): boolean {
  // If it's a Fetch response object or has a status
  const status = err.status || err.details?.httpStatusCode;
  
  if (status) {
    return status === 429 || (status >= 500 && status <= 599);
  }

  // Network errors (no status) are usually retryable
  if (err instanceof TypeError && err.message.includes("fetch")) {
    return true;
  }

  return false;
}

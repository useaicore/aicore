import { withRetry } from "./resilience.js";
import { jest, describe, it, expect } from "@jest/globals";

describe("withRetry Resilience Utility", () => {
  it("should succeed on first try if no error occurs", async () => {
    const fn = jest.fn<() => Promise<string>>().mockResolvedValue("Success");
    const result = await withRetry(fn);
    expect(result).toBe("Success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry on 429 status code and finally succeed", async () => {
    const fn = jest.fn<() => Promise<string | any>>()
      .mockRejectedValueOnce({ status: 429, message: "Rate limited" })
      .mockResolvedValueOnce("Success");
    
    // speed up tests
    const options = { baseDelayMs: 1, multiplier: 1, jitter: false };
    const result = await withRetry(fn, options);
    
    expect(result).toBe("Success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should retry on 500 status code and finally succeed", async () => {
      const fn = jest.fn<() => Promise<string | any>>()
        .mockRejectedValueOnce({ status: 500, message: "Server error" })
        .mockResolvedValueOnce("Success");
      
      const options = { baseDelayMs: 1, multiplier: 1, jitter: false };
      const result = await withRetry(fn, options);
      
      expect(result).toBe("Success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

  it("should throw after maximum retries are exhausted", async () => {
    const error = { status: 429, message: "Rate limited" };
    const fn = jest.fn<() => Promise<any>>().mockRejectedValue(error);
    
    const options = { maxRetries: 2, baseDelayMs: 1, multiplier: 1, jitter: false };
    
    await expect(withRetry(fn, options)).rejects.toEqual(error);
    expect(fn).toHaveBeenCalledTimes(3); 
  });

  it("should NOT retry on 401 (Auth Failure) or 400 (Validation) errors", async () => {
    const error = { status: 401, message: "Unauthorized" };
    const fn = jest.fn<() => Promise<any>>().mockRejectedValue(error);
    
    await expect(withRetry(fn)).rejects.toEqual(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

/**
 * @module errors/core
 *
 * Core error types and factories for the AICore platform.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

/**
 * Discriminant for every error that the AICore platform can surface.
 */
export type AICoreErrorType =
  | "config_error"
  | "provider_error"
  | "network_error"
  | "rate_limit_error"
  | "validation_error"
  | "aicore_internal";

/**
 * Provider- and component-level metadata attached to an AICoreError.
 */
export interface AICoreErrorDetails {
  provider?: string;
  component?: string;
  httpStatusCode?: number;
  providerErrorCode?: string;
  rawProviderError?: unknown;
}

/**
 * The canonical AICore error envelope.
 */
export interface AICoreError {
  type: AICoreErrorType;
  code: string;
  message: string;
  hint?: string;
  requestId?: string;
  details?: AICoreErrorDetails;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Builds an AICoreErrorDetails object, omitting undefined fields.
 * @internal
 */
export function buildDetails(opts: {
  provider?: string;
  component?: string;
  httpStatusCode?: number;
  providerErrorCode?: string;
  rawProviderError?: unknown;
}): AICoreErrorDetails | undefined {
  const d: AICoreErrorDetails = {};
  let hasKey = false;

  if (opts.provider !== undefined)        { d.provider          = opts.provider;          hasKey = true; }
  if (opts.component !== undefined)       { d.component         = opts.component;         hasKey = true; }
  if (opts.httpStatusCode !== undefined)  { d.httpStatusCode    = opts.httpStatusCode;    hasKey = true; }
  if (opts.providerErrorCode !== undefined) { d.providerErrorCode = opts.providerErrorCode; hasKey = true; }
  if (opts.rawProviderError !== undefined){ d.rawProviderError  = opts.rawProviderError;  hasKey = true; }

  return hasKey ? d : undefined;
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/** Shared params accepted by every factory. */
export interface BaseParams {
  code: string;
  message: string;
  hint?: string;
  requestId?: string;
  provider?: string;
  component?: string;
  httpStatusCode?: number;
  providerErrorCode?: string;
  rawProviderError?: unknown;
}

export function createConfigError(params: BaseParams): AICoreError {
  return {
    type: "config_error",
    code: params.code,
    message: params.message,
    ...(params.hint      !== undefined && { hint:      params.hint }),
    ...(params.requestId !== undefined && { requestId: params.requestId }),
    details: buildDetails(params),
  };
}

export function createProviderError(params: BaseParams): AICoreError {
  return {
    type: "provider_error",
    code: params.code,
    message: params.message,
    ...(params.hint      !== undefined && { hint:      params.hint }),
    ...(params.requestId !== undefined && { requestId: params.requestId }),
    details: buildDetails(params),
  };
}

export function createNetworkError(params: BaseParams): AICoreError {
  return {
    type: "network_error",
    code: params.code,
    message: params.message,
    ...(params.hint      !== undefined && { hint:      params.hint }),
    ...(params.requestId !== undefined && { requestId: params.requestId }),
    details: buildDetails(params),
  };
}

export function createInternalError(params: BaseParams): AICoreError {
  return {
    type: "aicore_internal",
    code: params.code,
    message: params.message,
    ...(params.hint      !== undefined && { hint:      params.hint }),
    ...(params.requestId !== undefined && { requestId: params.requestId }),
    details: buildDetails(params),
  };
}

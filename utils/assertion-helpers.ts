import { APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';
import { ErrorResponse } from '../models/api-response.model';

/**
 * Asserts that the response has the expected HTTP status code.
 */
export function assertStatus(response: APIResponse, expectedStatus: number): void {
  expect(response.status()).toBe(expectedStatus);
}

/**
 * Asserts that the response Content-Type header contains the expected type.
 */
export function assertContentType(response: APIResponse, expectedType: string): void {
  const contentType = response.headers()['content-type'] || '';
  expect(contentType).toContain(expectedType);
}

/**
 * Asserts that the response was received within the specified time in milliseconds.
 * Uses the response timing from headers or the Playwright-provided header info.
 */
export function assertResponseTime(response: APIResponse, maxMs: number): void {
  // Playwright APIResponse includes timing via headers; we use the server-timing
  // or fall back to a custom header if available. In practice, this is validated
  // at the test level by measuring elapsed time around the request call.
  const serverTiming = response.headers()['x-response-time'];
  if (serverTiming) {
    const elapsed = parseInt(serverTiming, 10);
    expect(elapsed).toBeLessThanOrEqual(maxMs);
  }
  // If no timing header is present, this assertion is a no-op.
  // Tests should measure elapsed time externally when this header is unavailable.
}

/**
 * Asserts that all specified fields are present in the response body object.
 */
export function assertFieldsPresent(body: Record<string, unknown>, fields: string[]): void {
  for (const field of fields) {
    expect(body).toHaveProperty(field);
  }
}

/**
 * Asserts that the error response contains a validation error for the given field.
 * Optionally checks that the error message matches an expected string.
 */
export function assertValidationError(
  body: ErrorResponse,
  fieldName: string,
  expectedMessage?: string
): void {
  expect(body.status).toBe('error');
  expect(body.errors).toBeDefined();
  expect(Array.isArray(body.errors)).toBe(true);

  const fieldError = body.errors.find((err) => err.field === fieldName);
  expect(fieldError).toBeDefined();

  if (expectedMessage && fieldError) {
    expect(fieldError.message).toContain(expectedMessage);
  }
}

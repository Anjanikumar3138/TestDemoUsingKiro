// Feature: user-registration-api-testing, Property 3: Required String Fields Reject Whitespace
import { test, expect } from '../../fixtures/api-fixture';
import * as fc from 'fast-check';
import { generateValidUser } from '../../utils/test-data-generator';

/**
 * Property 3: Required String Fields Reject Whitespace
 *
 * For any required string field (firstName, lastName, email) and for any string value
 * composed entirely of whitespace characters (including empty string), submitting a
 * registration request with that field set to such a value SHALL return HTTP 400
 * with a validation error identifying the field.
 *
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

const whitespaceArbitrary = fc.stringOf(
  fc.constantFrom(' ', '\t', '\n', '\r'),
  { minLength: 0, maxLength: 10 }
);

test.describe('Property 3: Required String Fields Reject Whitespace', () => {
  test('firstName with whitespace-only string should return 400', async ({ api }) => {
    await fc.assert(
      fc.asyncProperty(whitespaceArbitrary, async (whitespaceValue) => {
        const user = generateValidUser();
        user.firstName = whitespaceValue;

        const response = await api.post('/api/users/register', { data: user });

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.status).toBe('error');

        const errorFields = body.errors.map((e: { field: string }) => e.field);
        expect(errorFields).toContain('firstName');
      }),
      { numRuns: 100 }
    );
  });

  test('lastName with whitespace-only string should return 400', async ({ api }) => {
    await fc.assert(
      fc.asyncProperty(whitespaceArbitrary, async (whitespaceValue) => {
        const user = generateValidUser();
        user.lastName = whitespaceValue;

        const response = await api.post('/api/users/register', { data: user });

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.status).toBe('error');

        const errorFields = body.errors.map((e: { field: string }) => e.field);
        expect(errorFields).toContain('lastName');
      }),
      { numRuns: 100 }
    );
  });

  test('email with whitespace-only string should return 400', async ({ api }) => {
    await fc.assert(
      fc.asyncProperty(whitespaceArbitrary, async (whitespaceValue) => {
        const user = generateValidUser();
        user.email = whitespaceValue;

        const response = await api.post('/api/users/register', { data: user });

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.status).toBe('error');

        const errorFields = body.errors.map((e: { field: string }) => e.field);
        expect(errorFields).toContain('email');
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: user-registration-api-testing, Property 4: Invalid Email Format Rejected
// Feature: user-registration-api-testing, Property 5: Duplicate Email Rejected Case-Insensitively
import { test, expect } from '../../fixtures/api-fixture';
import * as fc from 'fast-check';
import { generateValidUser } from '../../utils/test-data-generator';

test.describe('Email Validation Property Tests', () => {
  /**
   * Property 4: Invalid Email Format Rejected
   *
   * For any string that does not contain exactly one @ symbol followed by a domain
   * with at least one dot, submitting it as the email field SHALL return HTTP 400
   * with an email format validation error.
   *
   * Validates: Requirements 2.4
   */
  test('Property 4: any invalid email format should be rejected with 400', async ({ api }) => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Strings without '@' symbol
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('@')),
          // Strings with multiple '@' symbols
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 15 }),
            fc.string({ minLength: 1, maxLength: 15 }),
            fc.string({ minLength: 1, maxLength: 15 })
          ).map(([a, b, c]) => `${a}@${b}@${c}`),
          // Strings with '@' but domain has no dot
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@') && !s.includes('.')),
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@') && !s.includes('.'))
          ).map(([local, domain]) => `${local}@${domain}`),
          // Empty string
          fc.constant('')
        ).filter(s => !s.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)),
        async (invalidEmail) => {
          const userData = generateValidUser();
          userData.email = invalidEmail;

          const response = await api.post('/api/users/register', { data: userData });

          expect(response.status()).toBe(400);

          const body = await response.json();
          expect(body.status).toBe('error');

          // Assert that the errors array contains an error for the 'email' field
          const emailError = body.errors.find(
            (err: { field: string; message: string }) => err.field === 'email'
          );
          expect(emailError).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: user-registration-api-testing, Property 5: Duplicate Email Rejected Case-Insensitively
test.describe('Duplicate Email Case-Insensitive Property Tests', () => {
  /**
   * Property 5: Duplicate Email Rejected Case-Insensitively
   *
   * For any valid user registration that succeeds, a subsequent registration request
   * with the same email address in any case variation (upper, lower, mixed) SHALL
   * return HTTP 409 with a duplicate email error.
   *
   * Validates: Requirements 2.5
   */
  test('Property 5: duplicate email with case variation should be rejected with 409', async ({ api }) => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a case transformation strategy: 'upper', 'lower', or 'mixed'
        fc.constantFrom('upper', 'lower', 'mixed'),
        async (caseVariation) => {
          // Step 1: Generate valid user data and register
          const userData = generateValidUser();

          const registerResponse = await api.post('/api/users/register', { data: userData });
          expect(registerResponse.status()).toBe(201);

          // Step 2: Create a case-varied version of the email
          const originalEmail = userData.email;
          let variedEmail: string;

          switch (caseVariation) {
            case 'upper':
              variedEmail = originalEmail.toUpperCase();
              break;
            case 'lower':
              variedEmail = originalEmail.toLowerCase();
              break;
            case 'mixed':
              // Apply mixed case: alternate characters between upper and lower
              variedEmail = originalEmail
                .split('')
                .map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
                .join('');
              break;
            default:
              variedEmail = originalEmail.toUpperCase();
          }

          // Step 3: Attempt to register again with case-varied email
          const duplicateUserData = generateValidUser();
          duplicateUserData.email = variedEmail;

          const duplicateResponse = await api.post('/api/users/register', { data: duplicateUserData });

          // Step 4: Assert 409 with duplicate email error
          expect(duplicateResponse.status()).toBe(409);

          const body = await duplicateResponse.json();
          expect(body.status).toBe('error');

          // Verify error indicates duplicate email
          const hasEmailError = body.errors?.some(
            (err: { field: string; message: string }) => err.field === 'email'
          ) || body.message?.toLowerCase().includes('email');
          expect(hasEmailError).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});

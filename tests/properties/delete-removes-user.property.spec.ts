// Feature: user-registration-api-testing, Property 2: DELETE Removes User
import { test, expect } from '../../fixtures/api-fixture';
import * as fc from 'fast-check';

/**
 * Property 2: DELETE Removes User
 *
 * For any successfully created user, sending a DELETE request for that user's ID
 * and then sending a GET request for the same ID SHALL result in the GET returning HTTP 404.
 *
 * Validates: Requirements 1.6
 */

// Arbitraries for generating valid user data
const firstNameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const lastNameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const emailArb = fc.tuple(
  fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)),
  fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)),
  fc.constantFrom('com', 'org', 'net', 'io', 'dev')
).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);
const phoneArb = fc.stringOf(fc.constantFrom('0','1','2','3','4','5','6','7','8','9'), { minLength: 10, maxLength: 10 });
const passwordArb = fc.string({ minLength: 8, maxLength: 50 }).filter(s => s.length >= 8);
const ageArb = fc.integer({ min: 18, max: 150 });
const addressLine1Arb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const cityArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const stateArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const countryArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

const validUserArb = fc.record({
  firstName: firstNameArb,
  lastName: lastNameArb,
  email: emailArb,
  phoneNumber: phoneArb,
  password: passwordArb,
  age: ageArb,
  addressLine1: addressLine1Arb,
  city: cityArb,
  state: stateArb,
  country: countryArb,
});

test.describe('Property 2: DELETE Removes User', () => {
  test('DELETE removes user - GET returns 404 after deletion', async ({ api }) => {
    // **Validates: Requirements 1.6**
    await fc.assert(
      fc.asyncProperty(validUserArb, async (userData) => {
        const requestBody = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          password: userData.password,
          confirmPassword: userData.password,
          age: userData.age,
          address: {
            addressLine1: userData.addressLine1,
            city: userData.city,
            state: userData.state,
            country: userData.country,
          },
        };

        // Step 1: POST to /api/users/register → assert 201
        const registerResponse = await api.post('/api/users/register', { data: requestBody });
        expect(registerResponse.status()).toBe(201);

        // Step 2: Extract user ID from response
        const registerBody = await registerResponse.json();
        const userId = registerBody.data.id;
        expect(userId).toBeDefined();

        // Step 3: DELETE /api/users/{id} → assert 200
        const deleteResponse = await api.delete(`/api/users/${userId}`);
        expect(deleteResponse.status()).toBe(200);

        // Step 4: GET /api/users/{id} → assert 404
        const getResponse = await api.get(`/api/users/${userId}`);
        expect(getResponse.status()).toBe(404);
      }),
      { numRuns: 100 }
    );
  });
});

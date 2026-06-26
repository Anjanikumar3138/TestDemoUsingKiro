// Feature: user-registration-api-testing, Property 1: Registration Round-Trip
import { test, expect } from '../../fixtures/api-fixture';
import * as fc from 'fast-check';

/**
 * **Validates: Requirements 1.4, 1.5**
 *
 * Property 1: Registration Round-Trip
 * For any valid user registration request, POSTing to /api/users/register and then
 * GETting /api/users/{id} with the returned ID SHALL produce a response containing
 * all originally submitted field values.
 */
test.describe('Property 1: Registration Round-Trip', () => {
  test('registered user data should be retrievable and match submitted values', async ({ api }) => {
    // Arbitraries for generating valid user data
    const firstNameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
    const lastNameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
    const emailLocalArb = fc.stringOf(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
      { minLength: 1, maxLength: 20 }
    );
    const emailDomainArb = fc.stringOf(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
      { minLength: 2, maxLength: 10 }
    );
    const emailArb = fc.tuple(emailLocalArb, emailDomainArb, emailDomainArb).map(
      ([local, domain, tld]) => `${local}@${domain}.${tld}`
    );
    const phoneNumberArb = fc.stringOf(
      fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'),
      { minLength: 10, maxLength: 10 }
    );
    const passwordArb = fc.string({ minLength: 8, maxLength: 50 });
    const ageArb = fc.integer({ min: 18, max: 150 });
    const addressLine1Arb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
    const cityArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
    const stateArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
    const countryArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

    const userDataArb = fc.record({
      firstName: firstNameArb,
      lastName: lastNameArb,
      email: emailArb,
      phoneNumber: phoneNumberArb,
      password: passwordArb,
      age: ageArb,
      addressLine1: addressLine1Arb,
      city: cityArb,
      state: stateArb,
      country: countryArb,
    });

    await fc.assert(
      fc.asyncProperty(userDataArb, async (data) => {
        const registrationPayload = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
          confirmPassword: data.password,
          age: data.age,
          address: {
            addressLine1: data.addressLine1,
            city: data.city,
            state: data.state,
            country: data.country,
          },
        };

        // POST to register
        const postResponse = await api.post('/api/users/register', { data: registrationPayload });
        expect(postResponse.status()).toBe(201);

        const postBody = await postResponse.json();
        const userId = postBody.data.id;
        expect(typeof userId).toBe('number');
        expect(userId).toBeGreaterThan(0);

        // GET by returned ID
        const getResponse = await api.get(`/api/users/${userId}`);
        expect(getResponse.status()).toBe(200);

        const getBody = await getResponse.json();
        const user = getBody.data;

        // Assert all fields match what was submitted
        expect(user.firstName).toBe(registrationPayload.firstName);
        expect(user.lastName).toBe(registrationPayload.lastName);
        expect(user.email).toBe(registrationPayload.email);
        expect(user.phoneNumber).toBe(registrationPayload.phoneNumber);
        expect(user.age).toBe(registrationPayload.age);
        expect(user.address.addressLine1).toBe(registrationPayload.address.addressLine1);
        expect(user.address.city).toBe(registrationPayload.address.city);
        expect(user.address.state).toBe(registrationPayload.address.state);
        expect(user.address.country).toBe(registrationPayload.address.country);
      }),
      { numRuns: 100 }
    );
  });
});

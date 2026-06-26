import { test, expect } from '../../fixtures/api-fixture';
import { generateValidUser, generateValidUserMandatoryOnly } from '../../utils/test-data-generator';
import { assertStatus, assertContentType, assertFieldsPresent } from '../../utils/assertion-helpers';

test.describe('Registration Positive Tests', () => {
  /**
   * Validates: Requirements 7.1, 7.5
   * Test: Successful registration with all valid fields
   */
  test('should register a user successfully with all valid fields', async ({ api }) => {
    const userData = generateValidUser();

    const startTime = Date.now();
    const response = await api.post('/api/users/register', { data: userData });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Assert status 201
    assertStatus(response, 201);

    // Assert Content-Type is application/json
    assertContentType(response, 'application/json');

    // Assert response time < 2000ms
    expect(responseTime).toBeLessThan(2000);

    const body = await response.json();

    // Assert response body has status "success"
    expect(body.status).toBe('success');

    // Assert response body data has id (number > 0)
    expect(body.data).toBeDefined();
    expect(typeof body.data.id).toBe('number');
    expect(body.data.id).toBeGreaterThan(0);

    // Assert body data contains all submitted fields
    assertFieldsPresent(body.data, [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'age',
      'address',
    ]);

    // Verify the submitted field values match
    expect(body.data.firstName).toBe(userData.firstName);
    expect(body.data.lastName).toBe(userData.lastName);
    expect(body.data.email).toBe(userData.email);
    expect(body.data.phoneNumber).toBe(userData.phoneNumber);
    expect(body.data.age).toBe(userData.age);
    expect(body.data.address).toEqual(userData.address);
  });

  /**
   * Validates: Requirements 7.2
   * Test: Successful registration with mandatory fields only
   */
  test('should register a user successfully with mandatory fields only', async ({ api }) => {
    const userData = generateValidUserMandatoryOnly();

    const response = await api.post('/api/users/register', { data: userData });

    // Assert status 201
    assertStatus(response, 201);

    // Assert Content-Type is application/json
    assertContentType(response, 'application/json');

    const body = await response.json();

    // Assert response body has status "success"
    expect(body.status).toBe('success');

    // Assert response body data has id
    expect(body.data).toBeDefined();
    expect(typeof body.data.id).toBe('number');
    expect(body.data.id).toBeGreaterThan(0);

    // Assert mandatory fields are present and match
    expect(body.data.firstName).toBe(userData.firstName);
    expect(body.data.lastName).toBe(userData.lastName);
    expect(body.data.email).toBe(userData.email);
    expect(body.data.phoneNumber).toBe(userData.phoneNumber);
    expect(body.data.age).toBe(userData.age);
    expect(body.data.address).toEqual(userData.address);

    // Assert optional fields are absent or null
    const optionalFields = ['dateOfBirth', 'gender', 'nationality', 'employeeId', 'isActive', 'skills'];
    for (const field of optionalFields) {
      const value = body.data[field];
      expect(value === undefined || value === null).toBeTruthy();
    }
  });
});

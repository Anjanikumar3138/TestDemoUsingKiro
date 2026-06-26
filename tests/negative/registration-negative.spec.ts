import { test, expect } from '../../fixtures/api-fixture';
import { generateValidUser, generateInvalidEmail, generateInvalidPhone } from '../../utils/test-data-generator';
import { assertStatus, assertContentType, assertValidationError } from '../../utils/assertion-helpers';

test.describe('Registration Negative Tests', () => {
  /**
   * Validates: Requirements 8.1
   * Test: Invalid email format returns 400 with email field error
   */
  test('should return 400 for invalid email format', async ({ api }) => {
    const userData = generateValidUser();
    userData.email = generateInvalidEmail();

    const response = await api.post('/api/users/register', { data: userData });

    // Assert status 400
    assertStatus(response, 400);

    // Assert Content-Type is application/json
    assertContentType(response, 'application/json');

    const body = await response.json();

    // Assert error response structure with email field error
    assertValidationError(body, 'email');
  });

  /**
   * Validates: Requirements 8.2
   * Test: Duplicate email returns 409 with duplicate email error
   */
  test('should return 409 for duplicate email registration', async ({ api }) => {
    // First, register a valid user
    const userData = generateValidUser();
    const firstResponse = await api.post('/api/users/register', { data: userData });
    assertStatus(firstResponse, 201);

    // Attempt to register again with the same email
    const duplicateUser = generateValidUser();
    duplicateUser.email = userData.email;

    const response = await api.post('/api/users/register', { data: duplicateUser });

    // Assert status 409
    assertStatus(response, 409);

    // Assert Content-Type is application/json
    assertContentType(response, 'application/json');

    const body = await response.json();

    // Assert error response mentions duplicate email
    expect(body.status).toBe('error');
    expect(body.message).toContain('Email already exists');
  });

  /**
   * Validates: Requirements 8.3
   * Test: Empty firstName returns 400 with firstName field error
   */
  test('should return 400 for empty firstName', async ({ api }) => {
    const userData = generateValidUser();
    userData.firstName = '';

    const response = await api.post('/api/users/register', { data: userData });

    // Assert status 400
    assertStatus(response, 400);

    // Assert Content-Type is application/json
    assertContentType(response, 'application/json');

    const body = await response.json();

    // Assert error response with firstName field error
    assertValidationError(body, 'firstName');
  });

  /**
   * Validates: Requirements 8.4
   * Test: Password mismatch returns 400 with confirmPassword field error
   */
  test('should return 400 for password mismatch', async ({ api }) => {
    const userData = generateValidUser();
    userData.confirmPassword = userData.password + 'different';

    const response = await api.post('/api/users/register', { data: userData });

    // Assert status 400
    assertStatus(response, 400);

    // Assert Content-Type is application/json
    assertContentType(response, 'application/json');

    const body = await response.json();

    // Assert error response with confirmPassword field error
    assertValidationError(body, 'confirmPassword');
  });

  /**
   * Validates: Requirements 8.5
   * Test: All mandatory fields missing returns 400 with errors for each field
   */
  test('should return 400 with multiple errors when all mandatory fields are missing', async ({ api }) => {
    const response = await api.post('/api/users/register', { data: {} });

    // Assert status 400
    assertStatus(response, 400);

    // Assert Content-Type is application/json
    assertContentType(response, 'application/json');

    const body = await response.json();

    // Assert error response structure
    expect(body.status).toBe('error');
    expect(body.errors).toBeDefined();
    expect(Array.isArray(body.errors)).toBe(true);

    // Assert errors exist for each mandatory field
    const mandatoryFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'password', 'age', 'address'];
    for (const field of mandatoryFields) {
      const fieldError = body.errors.find(
        (err: { field: string; message: string }) => err.field === field
      );
      expect(fieldError, `Expected validation error for field: ${field}`).toBeDefined();
    }
  });

  /**
   * Validates: Requirements 8.10
   * Test: Invalid phone number returns 400 with phone number validation error
   */
  test('should return 400 for invalid phone number', async ({ api }) => {
    const userData = generateValidUser();
    userData.phoneNumber = generateInvalidPhone();

    const response = await api.post('/api/users/register', { data: userData });

    // Assert status 400
    assertStatus(response, 400);

    // Assert Content-Type is application/json
    assertContentType(response, 'application/json');

    const body = await response.json();

    // Assert error response with phoneNumber field error
    assertValidationError(body, 'phoneNumber');
  });

  /**
   * Validates: Requirements 8.11
   * Test: Age below 18 returns 400 with age validation error
   */
  test('should return 400 for age below 18', async ({ api }) => {
    const userData = generateValidUser();
    userData.age = 15;

    const response = await api.post('/api/users/register', { data: userData });

    // Assert status 400
    assertStatus(response, 400);

    // Assert Content-Type is application/json
    assertContentType(response, 'application/json');

    const body = await response.json();

    // Assert error response with age field error
    assertValidationError(body, 'age');
  });
});

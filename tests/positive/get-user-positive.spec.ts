import { test, expect } from '../../fixtures/api-fixture';
import { generateValidUser } from '../../utils/test-data-generator';
import { assertStatus, assertContentType, assertFieldsPresent } from '../../utils/assertion-helpers';

test.describe('GET User Positive Tests', () => {
  /**
   * Validates: Requirements 7.3, 7.6
   * Test: Create a user via POST, then GET by ID and verify matching data
   */
  test('should retrieve a created user by ID with matching data', async ({ api }) => {
    // First create a user via POST
    const userData = generateValidUser();
    const createResponse = await api.post('/api/users/register', { data: userData });
    assertStatus(createResponse, 201);

    const createBody = await createResponse.json();
    const userId = createBody.data.id;
    expect(userId).toBeDefined();
    expect(typeof userId).toBe('number');

    // GET /api/users/{id}
    const getResponse = await api.get(`/api/users/${userId}`);

    // Assert status 200
    assertStatus(getResponse, 200);

    // Assert Content-Type contains 'application/json'
    assertContentType(getResponse, 'application/json');

    const getBody = await getResponse.json();

    // Assert body has status "success"
    expect(getBody.status).toBe('success');

    // Assert response data is present
    expect(getBody.data).toBeDefined();

    // Assert required fields are present
    assertFieldsPresent(getBody.data, [
      'id',
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'age',
      'address',
    ]);

    // Assert response body data matches the originally submitted user data
    expect(getBody.data.id).toBe(userId);
    expect(getBody.data.firstName).toBe(userData.firstName);
    expect(getBody.data.lastName).toBe(userData.lastName);
    expect(getBody.data.email).toBe(userData.email);
    expect(getBody.data.phoneNumber).toBe(userData.phoneNumber);
    expect(getBody.data.age).toBe(userData.age);
    expect(getBody.data.address).toEqual(userData.address);
  });
});

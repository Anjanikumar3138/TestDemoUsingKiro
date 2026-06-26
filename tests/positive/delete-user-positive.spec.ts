import { test, expect } from '../../fixtures/api-fixture';
import { generateValidUser } from '../../utils/test-data-generator';
import { assertStatus, assertContentType } from '../../utils/assertion-helpers';

test.describe('DELETE User Positive Tests', () => {
  /**
   * Validates: Requirements 7.4
   * Test: Create a user via POST, then DELETE by ID and verify confirmation
   */
  test('should delete a created user by ID and return confirmation', async ({ api }) => {
    // First create a user via POST
    const userData = generateValidUser();
    const createResponse = await api.post('/api/users/register', { data: userData });
    assertStatus(createResponse, 201);

    const createBody = await createResponse.json();
    const userId = createBody.data.id;
    expect(userId).toBeDefined();
    expect(typeof userId).toBe('number');

    // DELETE /api/users/{id}
    const deleteResponse = await api.delete(`/api/users/${userId}`);

    // Assert status 200
    assertStatus(deleteResponse, 200);

    const deleteBody = await deleteResponse.json();

    // Assert response body has status "success"
    expect(deleteBody.status).toBe('success');

    // Assert response body contains message with "deleted"
    expect(deleteBody.message).toBeDefined();
    expect(deleteBody.message.toLowerCase()).toContain('deleted');

    // Verify GET after delete returns 404
    const getResponse = await api.get(`/api/users/${userId}`);
    assertStatus(getResponse, 404);

    const getBody = await getResponse.json();
    expect(getBody.status).toBe('error');
  });
});

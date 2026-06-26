import { test, expect } from '../../fixtures/api-fixture';
import { assertStatus, assertContentType } from '../../utils/assertion-helpers';

test.describe('GET User Negative Tests', () => {
  /**
   * Validates: Requirements 8.6
   * Test: GET with invalid user ID format returns 400
   */
  test('should return 400 for invalid ID format', async ({ api }) => {
    const response = await api.get('/api/users/abc');

    // Assert status 400
    assertStatus(response, 400);

    // Assert Content-Type is application/json
    assertContentType(response, 'application/json');

    const body = await response.json();

    // Assert error response structure
    expect(body.status).toBe('error');
    expect(body.message).toBeDefined();

    // The error message about invalid ID is in the errors array
    expect(body.errors).toBeDefined();
    expect(Array.isArray(body.errors)).toBe(true);
    const idError = body.errors.find((e: { field: string; message: string }) => e.field === 'id');
    expect(idError).toBeDefined();
    expect(idError.message.toLowerCase()).toContain('integer');
  });

  /**
   * Validates: Requirements 8.7
   * Test: GET with non-existing numeric user ID returns 404
   */
  test('should return 404 for non-existing numeric user ID', async ({ api }) => {
    const response = await api.get('/api/users/999999');

    // Assert status 404
    assertStatus(response, 404);

    // Assert Content-Type is application/json
    assertContentType(response, 'application/json');

    const body = await response.json();

    // Assert error response with user not found message
    expect(body.status).toBe('error');
    expect(body.message).toBeDefined();
    expect(body.message.toLowerCase()).toContain('not found');
  });
});

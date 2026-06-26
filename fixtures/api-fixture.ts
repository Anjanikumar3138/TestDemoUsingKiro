import { test as base, APIRequestContext, APIResponse } from '@playwright/test';
import { getBaseUrl } from '../utils/config-reader';
import logger from '../utils/logger';

/**
 * Custom Playwright fixture that provides a pre-configured APIRequestContext
 * with baseURL from config, default Content-Type header, and Winston request/response logging.
 *
 * Validates: Requirements 6.3, 6.10, 9.5
 */

/**
 * Wraps an APIRequestContext to automatically log requests and responses via Winston.
 */
function createLoggingContext(context: APIRequestContext): APIRequestContext {
  const handler: ProxyHandler<APIRequestContext> = {
    get(target, prop, receiver) {
      const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'fetch'];
      if (typeof prop === 'string' && httpMethods.includes(prop)) {
        return async (url: string, options?: Record<string, unknown>) => {
          const method = prop.toUpperCase();
          const body = options?.data ? JSON.stringify(options.data, null, 2) : undefined;

          // Log request in a readable format
          logger.info(`\n${'='.repeat(60)}`);
          logger.info(`REQUEST: ${method} ${url}`);
          if (body) {
            logger.info(`Request Body:\n${body}`);
          }
          logger.info(`${'─'.repeat(60)}`);

          // Execute the actual request
          const response: APIResponse = await (target as any)[prop](url, options);

          // Log response in a readable format
          let responseBody: string;
          try {
            responseBody = JSON.stringify(await response.json(), null, 2);
          } catch {
            responseBody = await response.text();
          }
          logger.info(`RESPONSE: ${response.status()} ${response.statusText()}`);
          logger.info(`Response Body:\n${responseBody}`);
          logger.info(`${'='.repeat(60)}\n`);

          return response;
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  };

  return new Proxy(context, handler);
}

export const test = base.extend<{ api: APIRequestContext }>({
  api: async ({ playwright }, use) => {
    const baseURL = getBaseUrl();

    const context = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });

    // Wrap context with logging proxy
    const loggingContext = createLoggingContext(context);

    // Provide the logging-enabled context to tests
    await use(loggingContext);

    // Cleanup
    await context.dispose();
  },
});

export { expect } from '@playwright/test';

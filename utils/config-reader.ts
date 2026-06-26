import * as path from 'path';
import * as fs from 'fs';

interface TestConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

const configPath = path.resolve(__dirname, '..', 'config', 'test.config.json');
const configData: TestConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

/**
 * Returns the base URL for the API under test.
 */
export function getBaseUrl(): string {
  return configData.baseUrl;
}

/**
 * Returns the timeout value in milliseconds for test operations.
 */
export function getTimeout(): number {
  return configData.timeout;
}

/**
 * Returns the number of test retries on failure.
 */
export function getRetries(): number {
  return configData.retries;
}

/**
 * Successful API response wrapper.
 */
export interface SuccessResponse<T> {
  status: 'success';
  data: T;
  message?: string;
}

/**
 * Error API response wrapper containing validation errors.
 */
export interface ErrorResponse {
  status: 'error';
  errors: ValidationError[];
  message: string;
}

/**
 * Individual validation error identifying a field and its error message.
 */
export interface ValidationError {
  field: string;
  message: string;
}

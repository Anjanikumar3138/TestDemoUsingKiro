/**
 * Address interface representing a user's physical address.
 */
export interface Address {
  /** Street address line 1, max 100 characters */
  addressLine1: string;
  /** Street address line 2, max 100 characters, optional */
  addressLine2?: string;
  /** City name, max 50 characters */
  city: string;
  /** State/province, max 50 characters */
  state: string;
  /** Country name, max 50 characters */
  country: string;
}

/**
 * User interface representing a registered user in the system.
 */
export interface User {
  /** System-generated auto-increment ID */
  id: number;
  /** Required, max 50 characters */
  firstName: string;
  /** Required, max 50 characters */
  lastName: string;
  /** Required, max 100 characters, unique (case-insensitive) */
  email: string;
  /** Required, exactly 10 digits */
  phoneNumber: string;
  /** Required, 8-128 characters */
  password: string;
  /** ISO 8601 date format, optional */
  dateOfBirth?: string;
  /** Required, integer 18-150 */
  age: number;
  /** Optional */
  gender?: string;
  /** Max 50 characters, optional */
  nationality?: string;
  /** Max 20 characters, optional */
  employeeId?: string;
  /** Optional */
  isActive?: boolean;
  /** Required */
  address: Address;
  /** Max 20 items, optional */
  skills?: string[];
}

/**
 * Registration request payload. Extends User (without id) and adds confirmPassword.
 */
export interface UserRegistrationRequest extends Omit<User, 'id'> {
  /** Must match password */
  confirmPassword: string;
}

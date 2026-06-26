import { faker } from '@faker-js/faker';
import { UserRegistrationRequest } from '../models/user.model';

/**
 * Generates a valid user registration request with all fields populated.
 */
export function generateValidUser(): UserRegistrationRequest {
  const password = faker.internet.password({ length: 12 });
  return {
    firstName: faker.person.firstName().slice(0, 50),
    lastName: faker.person.lastName().slice(0, 50),
    email: faker.internet.email().slice(0, 100),
    phoneNumber: faker.string.numeric(10),
    password,
    confirmPassword: password,
    dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0],
    age: faker.number.int({ min: 18, max: 150 }),
    gender: faker.person.gender(),
    nationality: faker.location.country().slice(0, 50),
    employeeId: faker.string.alphanumeric(10).slice(0, 20),
    isActive: true,
    address: {
      addressLine1: faker.location.streetAddress().slice(0, 100),
      addressLine2: faker.location.secondaryAddress().slice(0, 100),
      city: faker.location.city().slice(0, 50),
      state: faker.location.state().slice(0, 50),
      country: faker.location.country().slice(0, 50),
    },
    skills: [faker.person.jobType(), faker.person.jobArea()],
  };
}

/**
 * Generates a valid user registration request with only mandatory fields.
 */
export function generateValidUserMandatoryOnly(): UserRegistrationRequest {
  const password = faker.internet.password({ length: 12 });
  return {
    firstName: faker.person.firstName().slice(0, 50),
    lastName: faker.person.lastName().slice(0, 50),
    email: faker.internet.email().slice(0, 100),
    phoneNumber: faker.string.numeric(10),
    password,
    confirmPassword: password,
    age: faker.number.int({ min: 18, max: 150 }),
    address: {
      addressLine1: faker.location.streetAddress().slice(0, 100),
      city: faker.location.city().slice(0, 50),
      state: faker.location.state().slice(0, 50),
      country: faker.location.country().slice(0, 50),
    },
  };
}

/**
 * Generates a string that is not a valid email format.
 */
export function generateInvalidEmail(): string {
  const options = [
    'notanemail',
    'missing@domain',
    '@nodomain.com',
    'spaces in@email.com',
    'double@@at.com',
    faker.string.alphanumeric(10),
  ];
  return options[faker.number.int({ min: 0, max: options.length - 1 })];
}

/**
 * Generates a password that is shorter than the 8-character minimum.
 */
export function generateShortPassword(): string {
  const length = faker.number.int({ min: 1, max: 7 });
  return faker.internet.password({ length });
}

/**
 * Generates a phone number that does not meet the 10-digit requirement.
 */
export function generateInvalidPhone(): string {
  const options = [
    faker.string.numeric(9),       // too short
    faker.string.numeric(11),      // too long
    faker.string.alpha(10),        // letters instead of digits
    '12345abcde',                  // mix of digits and letters
    '',                            // empty
  ];
  return options[faker.number.int({ min: 0, max: options.length - 1 })];
}

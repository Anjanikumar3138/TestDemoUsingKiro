# Implementation Plan: User Registration API Testing

## Overview

This plan implements a comprehensive API Testing Framework for a User Registration REST API. It covers building the Express.js API application with validation, creating a Playwright-based test automation framework with property-based and example-based tests, generating a Postman collection for manual testing, and producing project documentation. All code is TypeScript-based, using Node.js, Express.js, Playwright, fast-check, and Winston.

## Tasks

- [x] 1. Set up project structure and core dependencies
  - [x] 1.1 Initialize project with package.json and install dependencies
    - Initialize npm project with TypeScript, Express.js, express-validator, @playwright/test, fast-check, @faker-js/faker, winston, and allure-playwright
    - Create tsconfig.json for both API application and test framework
    - Set up npm scripts for building, starting the API, and running tests
    - _Requirements: 1.8, 6.1, 9.3_

  - [x] 1.2 Create directory structure and TypeScript interfaces
    - Create API directories: `src/`, `src/routes/`, `src/controllers/`, `src/middleware/`, `src/store/`
    - Create test framework directories: `tests/properties/`, `tests/positive/`, `tests/negative/`, `utils/`, `models/`, `config/`, `fixtures/`, `logs/`
    - Define TypeScript interfaces for User, Address, UserRegistrationRequest, SuccessResponse, ErrorResponse, and ValidationError in `models/`
    - _Requirements: 6.2, 6.5_

- [x] 2. Implement API application
  - [x] 2.1 Implement in-memory store
    - Create `src/store/user.store.ts` with a singleton Map-based store
    - Implement methods: add(user), getById(id), deleteById(id), existsByEmail(email)
    - Use auto-incrementing numeric ID counter
    - _Requirements: 1.7_

  - [x] 2.2 Implement validation middleware
    - Create `src/middleware/validation.ts` using express-validator
    - Implement registerValidation chain: firstName required/max 50, lastName required/max 50, email required/valid format/max 100, phoneNumber exactly 10 digits, password 8-128 chars, confirmPassword must match password, age 18-150 integer, address required with sub-fields
    - Implement idValidation chain for positive integer path param
    - Implement handleValidationErrors that collects all errors and returns them in a single 400 response
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8, 2.9, 2.11, 2.13, 2.14, 2.15_

  - [x] 2.3 Implement user controller
    - Create `src/controllers/user.controller.ts` with createUser, getUser, deleteUser functions
    - createUser: check email uniqueness (case-insensitive), assign ID, persist, return 201
    - getUser: lookup by ID, return 200 or 404
    - deleteUser: remove by ID, return 200 or 404
    - _Requirements: 1.4, 1.5, 1.6, 1.9, 1.10, 1.11, 2.5, 2.10, 2.12_

  - [x] 2.4 Implement routes and Express server
    - Create `src/routes/user.routes.ts` mounting POST /api/users/register, GET /api/users/:id, DELETE /api/users/:id with respective validation and controller handlers
    - Create `src/app.ts` configuring Express with JSON body parser, CORS, route mounting, global error handler, and server start on configurable port
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Checkpoint - Verify API application builds and starts
  - Ensure the API application compiles without TypeScript errors and starts successfully. Ask the user if questions arise.

- [x] 4. Set up test framework infrastructure
  - [x] 4.1 Create Playwright configuration
    - Create `playwright.config.ts` with API testing project, HTML reporter, optional Allure reporter, timeout settings, and retry configuration
    - _Requirements: 6.8, 9.1, 9.2_

  - [x] 4.2 Create custom Playwright fixture
    - Create `fixtures/api-fixture.ts` extending base test with a pre-configured APIRequestContext
    - Configure baseURL from external config, default Content-Type header, and Winston request/response logging
    - _Requirements: 6.3, 6.10, 9.5_

  - [x] 4.3 Create utility modules
    - Create `utils/config-reader.ts` loading settings from `config/test.config.json`
    - Create `utils/test-data-generator.ts` using @faker-js/faker for generating valid and invalid test data
    - Create `utils/assertion-helpers.ts` with reusable functions: assertStatus, assertContentType, assertResponseTime, assertFieldsPresent, assertValidationError
    - Create `utils/logger.ts` configuring Winston to console and date-stamped log file
    - Create `config/test.config.json` with baseUrl, timeout, and retry settings
    - _Requirements: 6.6, 6.7, 9.5_

- [x] 5. Implement positive test cases
  - [x] 5.1 Implement registration positive tests
    - Create `tests/positive/registration-positive.spec.ts`
    - Test: successful registration with all valid fields, assert 201, body contains all fields and generated ID, Content-Type is application/json, response time < 2000ms
    - Test: successful registration with mandatory fields only, assert 201, optional fields absent or null
    - _Requirements: 7.1, 7.2, 7.5_

  - [x] 5.2 Implement GET and DELETE positive tests
    - Create `tests/positive/get-user-positive.spec.ts`: create user via POST, GET by ID, assert 200 with matching data and Content-Type
    - Create `tests/positive/delete-user-positive.spec.ts`: create user via POST, DELETE by ID, assert 200 with confirmation message
    - _Requirements: 7.3, 7.4, 7.6_

- [x] 6. Implement negative test cases
  - [x] 6.1 Implement registration negative tests
    - Create `tests/negative/registration-negative.spec.ts`
    - Test: invalid email format → 400
    - Test: duplicate email → 409
    - Test: empty firstName → 400
    - Test: password mismatch → 400
    - Test: all mandatory fields missing → 400 with errors for each field
    - Test: invalid phone number → 400
    - Test: age below 18 → 400
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.10, 8.11_

  - [x] 6.2 Implement GET and DELETE negative tests
    - Create `tests/negative/get-user-negative.spec.ts`: invalid ID format → 400, non-existing numeric ID → 404
    - Create `tests/negative/delete-user-negative.spec.ts`: invalid ID format → 400, non-existing numeric ID → 404
    - _Requirements: 8.6, 8.7, 8.8, 8.9_

- [x] 7. Checkpoint - Verify all example tests pass
  - Ensure all positive and negative tests pass against the running API. Ask the user if questions arise.

- [ ] 8. Implement property-based tests
  - [ ] 8.1 Write property test for registration round-trip
    - Create `tests/properties/registration-roundtrip.property.spec.ts`
    - **Property 1: Registration Round-Trip**
    - Generate random valid user data with fast-check, POST to register, GET by returned ID, assert all fields match
    - **Validates: Requirements 1.4, 1.5**

  - [ ] 8.2 Write property test for DELETE removes user
    - Create `tests/properties/delete-removes-user.property.spec.ts`
    - **Property 2: DELETE Removes User**
    - Generate random valid user, register, DELETE, then GET returns 404
    - **Validates: Requirements 1.6**

  - [ ] 8.3 Write property test for required string fields reject whitespace
    - Create `tests/properties/validation-required-fields.property.spec.ts`
    - **Property 3: Required String Fields Reject Whitespace**
    - For each required string field (firstName, lastName, email), generate whitespace-only strings, assert 400
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ] 8.4 Write property test for invalid email format rejected
    - Create `tests/properties/validation-email.property.spec.ts`
    - **Property 4: Invalid Email Format Rejected**
    - Generate strings without valid email structure, assert 400 with email error
    - **Validates: Requirements 2.4**

  - [ ] 8.5 Write property test for duplicate email rejected case-insensitively
    - Add to `tests/properties/validation-email.property.spec.ts`
    - **Property 5: Duplicate Email Rejected Case-Insensitively**
    - Register user, then re-register with case-varied email, assert 409
    - **Validates: Requirements 2.5**

  - [ ] 8.6 Write property test for password mismatch rejected
    - Create `tests/properties/validation-password.property.spec.ts`
    - **Property 6: Password Mismatch Rejected**
    - Generate two distinct strings for password and confirmPassword, assert 400
    - **Validates: Requirements 2.6**

  - [ ] 8.7 Write property test for invalid phone number rejected
    - Create `tests/properties/validation-phone-age.property.spec.ts`
    - **Property 7: Invalid Phone Number Rejected**
    - Generate strings that are not exactly 10 numeric digits, assert 400
    - **Validates: Requirements 2.7**

  - [ ] 8.8 Write property test for age out of range rejected
    - Add to `tests/properties/validation-phone-age.property.spec.ts`
    - **Property 8: Age Out of Range Rejected**
    - Generate integers < 18 or > 150, assert 400
    - **Validates: Requirements 2.8**

  - [ ] 8.9 Write property test for invalid password length rejected
    - Add to `tests/properties/validation-password.property.spec.ts`
    - **Property 9: Invalid Password Length Rejected**
    - Generate strings with length < 8 or > 128, assert 400
    - **Validates: Requirements 2.14**

  - [ ] 8.10 Write property test for non-existing numeric ID returns 404
    - Create `tests/properties/id-validation.property.spec.ts`
    - **Property 10: Non-Existing Numeric ID Returns 404**
    - Generate large positive integers, GET and DELETE both return 404
    - **Validates: Requirements 1.10, 1.11, 2.10, 2.12**

  - [ ] 8.11 Write property test for non-numeric ID returns 400
    - Add to `tests/properties/id-validation.property.spec.ts`
    - **Property 11: Non-Numeric ID Returns 400**
    - Generate non-integer strings (letters, special chars, decimals, negatives), GET and DELETE both return 400
    - **Validates: Requirements 2.11, 2.13**

  - [ ] 8.12 Write property test for multiple validation errors returned together
    - Create `tests/properties/multiple-errors.property.spec.ts`
    - **Property 12: Multiple Validation Errors Returned Together**
    - Generate requests with N (≥2) independently invalid fields, assert response contains at least N error messages
    - **Validates: Requirements 2.15**

- [x] 9. Create Postman collection
  - [x] 9.1 Create Postman collection file
    - Create `postman/user-registration-api.postman_collection.json` in Postman Collection v2.1 format
    - Include Create User (POST), Get User (GET), Delete User (DELETE) requests
    - Define environment variables: baseUrl, userId, userEmail
    - Add test scripts for status validation, response field checks, and variable chaining
    - Configure request ordering for Collection Runner: Create → Get → Delete
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ] 10. Create documentation
  - [ ] 10.1 Create functional test scenarios document
    - Create `docs/functional-test-scenarios.md` with at least 17 unique scenarios
    - Cover Registration (all fields, mandatory only, duplicate email, invalid email, password mismatch, blank mandatory fields, invalid phone, age below 18, missing address)
    - Cover Get User (existing, deleted, non-existing, invalid ID)
    - Cover Delete User (existing, already-deleted, non-existing, invalid ID)
    - Each scenario: name, category, preconditions, test data summary, expected HTTP status, expected response description
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 10.2 Create detailed test cases document
    - Create `docs/test-cases.md` with at least 20 test cases (min 9 POST, 4 GET, 4 DELETE)
    - Include columns: Test Case ID, Module, Scenario, Preconditions, Test Steps, Test Data, Expected Result, Actual Result, Status
    - Use TC_REG_xxx, TC_GET_xxx, TC_DEL_xxx format for IDs
    - Include at least 3 positive and 10 negative test cases
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 10.3 Create project documentation
    - Create `docs/project-report.md` with all required sections: Objective, Scope, Tools Used, API Endpoints, Test Approach, Functional Test Scenarios, Test Cases Table, Automation Framework Design, Execution Results Summary, Defects Found, Conclusion
    - Include table of contents with navigable links
    - Include technology stack with versions and purposes
    - Include framework architecture description with directory structure
    - Include setup instructions with prerequisites and numbered steps
    - Include test execution summary table
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 11. Final checkpoint - Ensure all tests pass and reports generate
  - Ensure all tests pass (property-based and example-based), HTML report generates in `playwright-report/`, and logs are written to `logs/`. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check with minimum 100 iterations each
- Example-based tests (positive/negative) cover specific scenarios from Requirements 7 and 8
- The API server must be running before test execution; consider adding a `webServer` config in playwright.config.ts to auto-start it
- All tests use the custom Playwright fixture for consistent logging and configuration

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "4.1", "4.3"] },
    { "id": 3, "tasks": ["2.2", "2.3", "4.2"] },
    { "id": 4, "tasks": ["2.4"] },
    { "id": 5, "tasks": ["5.1", "5.2", "6.1", "6.2", "9.1"] },
    { "id": 6, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6", "8.7", "8.8", "8.9", "8.10", "8.11", "8.12"] },
    { "id": 7, "tasks": ["10.1", "10.2", "10.3"] }
  ]
}
```

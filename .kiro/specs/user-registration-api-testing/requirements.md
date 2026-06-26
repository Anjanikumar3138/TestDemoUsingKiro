# Requirements Document

## Introduction

This document defines the requirements for a comprehensive API Testing Framework for a User Registration REST API. The framework encompasses the creation of a Node.js/Express.js API application, a Postman Collection for manual testing, functional test scenarios, detailed test cases, and a Playwright API Testing automation framework with positive and negative test cases, reporting, and professional documentation.

## Glossary

- **Registration_API**: The Express.js REST API application providing user registration endpoints (POST, GET, DELETE)
- **Test_Framework**: The Playwright API Testing-based automation framework for executing API test cases using @playwright/test and APIRequestContext
- **Postman_Collection**: The exported Postman collection containing organized API requests, environment variables, and test scripts
- **Test_Report**: The generated output from Playwright HTML Reporter and optional Allure reporting tools showing test execution results
- **User_Model**: The data model representing a user entity with personal details, address, and skills, defined as TypeScript interfaces
- **In_Memory_Store**: The in-memory data store (Map/Object or SQLite in-memory) used for persisting user data during application runtime
- **Validation_Engine**: The Express.js request validation mechanism (express-validator or Joi) that enforces field constraints
- **Collection_Runner**: The Postman feature for executing multiple requests in sequence with data-driven testing
- **Playwright_Report**: The HTML-based test reporting tool built into Playwright that provides detailed execution visualization
- **Test_Scenario**: A functional scenario describing a specific test condition and expected outcome
- **Project_Documentation**: The professional report documenting the complete testing project

## Requirements

### Requirement 1: Express.js API Application

**User Story:** As a QA Engineer, I want a Node.js/Express.js REST API application with user registration endpoints, so that I have a testable API to validate against.

#### Acceptance Criteria

1. THE Registration_API SHALL expose a POST endpoint at `/api/users/register` that accepts a JSON request body containing firstName (string, max 50 characters), lastName (string, max 50 characters), email (string, max 100 characters), phoneNumber (string, max 15 characters), password (string, min 8 max 50 characters), confirmPassword (string), dateOfBirth (string in ISO 8601 date format), age (integer, 0 to 150), gender (string), nationality (string, max 50 characters), employeeId (string, max 20 characters), isActive (boolean), address (object with addressLine1 string max 100 characters, addressLine2 string max 100 characters, city string max 50 characters, state string max 50 characters, country string max 50 characters), and skills (array of strings, max 20 items) fields
2. THE Registration_API SHALL expose a GET endpoint at `/api/users/{id}` that returns the user details for the specified user ID
3. THE Registration_API SHALL expose a DELETE endpoint at `/api/users/{id}` that removes the user with the specified ID from the In_Memory_Store
4. WHEN a valid registration request is received, THE Registration_API SHALL persist the user in the In_Memory_Store and return HTTP status 201 with the created user object including a system-generated unique user ID
5. WHEN a GET request is received with an existing user ID, THE Registration_API SHALL return HTTP status 200 with the complete user details including all fields submitted during registration and the generated user ID
6. WHEN a DELETE request is received with an existing user ID, THE Registration_API SHALL remove the user from the In_Memory_Store and return HTTP status 200 with a confirmation message
7. THE Registration_API SHALL use the In_Memory_Store (a JavaScript Map/Object or SQLite in-memory database) as the data store for all user persistence operations
8. THE Registration_API SHALL be built using TypeScript, Node.js, Express.js, and npm as the package manager with dependencies defined in package.json
9. IF a registration request is received with invalid or missing required fields, THEN THE Registration_API SHALL reject the request with HTTP status 400 and return an error response indicating which fields failed validation
10. IF a GET request is received with a user ID that does not exist in the In_Memory_Store, THEN THE Registration_API SHALL return HTTP status 404 with an error response indicating the user was not found
11. IF a DELETE request is received with a user ID that does not exist in the In_Memory_Store, THEN THE Registration_API SHALL return HTTP status 404 with an error response indicating the user was not found

### Requirement 2: Request Validation

**User Story:** As a QA Engineer, I want the API to enforce field validation rules, so that I can test both valid and invalid input scenarios.

#### Acceptance Criteria

1. WHEN a registration request is missing the firstName field (null, empty string, or whitespace-only), THE Validation_Engine SHALL return HTTP status 400 with a JSON response body containing a field-level validation error message indicating firstName is required
2. WHEN a registration request is missing the lastName field (null, empty string, or whitespace-only), THE Validation_Engine SHALL return HTTP status 400 with a JSON response body containing a field-level validation error message indicating lastName is required
3. WHEN a registration request is missing the email field (null, empty string, or whitespace-only), THE Validation_Engine SHALL return HTTP status 400 with a JSON response body containing a field-level validation error message indicating email is required
4. WHEN a registration request contains an email that does not contain exactly one @ symbol followed by a domain with at least one dot, THE Validation_Engine SHALL return HTTP status 400 with a JSON response body containing a validation error message indicating invalid email format
5. WHEN a registration request contains an email that already exists in the In_Memory_Store (case-insensitive comparison), THE Validation_Engine SHALL return HTTP status 409 with a JSON response body containing an error message indicating duplicate email
6. WHEN a registration request has password and confirmPassword fields that do not match (exact string comparison), THE Validation_Engine SHALL return HTTP status 400 with a JSON response body containing a validation error message indicating password mismatch
7. WHEN a registration request contains a phoneNumber that is not exactly 10 numeric digits (0-9), THE Validation_Engine SHALL return HTTP status 400 with a JSON response body containing a validation error message indicating invalid phone number
8. WHEN a registration request contains an age value below 18 or above 150, THE Validation_Engine SHALL return HTTP status 400 with a JSON response body containing a validation error message indicating age must be between 18 and 150
9. WHEN a registration request is missing the address object (null or absent), THE Validation_Engine SHALL return HTTP status 400 with a JSON response body containing a validation error message indicating address is required
10. WHEN a GET request is received with a non-existing user ID, THE Registration_API SHALL return HTTP status 404 with a JSON response body containing an error message indicating user not found
11. WHEN a GET request is received with a user ID that is not a valid numeric value, THE Registration_API SHALL return HTTP status 400 with a JSON response body containing an error message indicating invalid ID format
12. WHEN a DELETE request is received with a non-existing user ID, THE Registration_API SHALL return HTTP status 404 with a JSON response body containing an error message indicating user not found
13. WHEN a DELETE request is received with a user ID that is not a valid numeric value, THE Registration_API SHALL return HTTP status 400 with a JSON response body containing an error message indicating invalid ID format
14. WHEN a registration request contains a password shorter than 8 characters or longer than 128 characters, THE Validation_Engine SHALL return HTTP status 400 with a JSON response body containing a validation error message indicating password must be between 8 and 128 characters
15. WHEN a registration request contains multiple validation errors, THE Validation_Engine SHALL return HTTP status 400 with a JSON response body containing validation error messages for all failed fields in a single response

### Requirement 3: Postman Collection

**User Story:** As a QA Engineer, I want a Postman Collection with organized requests and test scripts, so that I can manually test and validate the API endpoints.

#### Acceptance Criteria

1. THE Postman_Collection SHALL contain a Create User request targeting POST `/api/users/register` with a sample request body containing all User_Model fields: firstName, lastName, email, phoneNumber, password, confirmPassword, dateOfBirth, age, gender, nationality, employeeId, isActive, address (with addressLine1, addressLine2, city, state, country), and skills
2. THE Postman_Collection SHALL contain a Get User request targeting GET `/api/users/{id}` using the userId environment variable for the path parameter
3. THE Postman_Collection SHALL contain a Delete User request targeting DELETE `/api/users/{id}` using the userId environment variable for the path parameter
4. THE Postman_Collection SHALL define environment variables for baseUrl, userId, and userEmail with placeholder default values
5. WHEN the Create User request executes successfully, THE Postman_Collection SHALL include a test script that validates the response status code is 201, response body contains a non-null user ID, response time is below 2000 milliseconds, and sets the userId environment variable from the response body for use by subsequent requests
6. WHEN the Get User request executes successfully, THE Postman_Collection SHALL include a test script that validates the response status code is 200 and response body contains the fields firstName, lastName, email, phoneNumber, and address
7. WHEN the Delete User request executes successfully, THE Postman_Collection SHALL include a test script that validates the response status code is 200 and response body contains a message field indicating successful deletion
8. THE Postman_Collection SHALL be configured for execution via the Collection_Runner with request ordering: Create User first, Get User second, Delete User third
9. THE Postman_Collection SHALL be exported in Postman Collection v2.1 format

### Requirement 4: Functional Test Scenarios

**User Story:** As a QA Engineer, I want comprehensive functional test scenarios documented, so that I have complete coverage of all testable conditions.

#### Acceptance Criteria

1. THE Test_Scenario document SHALL include scenarios for User Registration: successful registration with all fields (all mandatory and optional fields populated), successful registration with mandatory fields only (firstName, lastName, email, phoneNumber, password, confirmPassword, dateOfBirth, age, gender, nationality, address), duplicate email registration, invalid email format, password mismatch, blank mandatory fields (one scenario per mandatory field), invalid phone number (not exactly 10 digits), age below 18, and missing address object
2. THE Test_Scenario document SHALL include scenarios for Get User: fetch existing user, fetch deleted user (user previously deleted, expect 404 response), fetch non-existing user (ID never created), and fetch with invalid ID format
3. THE Test_Scenario document SHALL include scenarios for Delete User: delete existing user, delete already-deleted user (user previously deleted, expect 404 response), delete non-existing user (ID never created), and delete with invalid ID format
4. WHEN documenting each Test_Scenario, THE document SHALL specify the scenario name, category (positive or negative), preconditions (initial system state required), test data summary (key input values), expected HTTP status code, and expected response description (including whether the response body contains the created/fetched resource or a validation error message indicating the failure reason)
5. THE Test_Scenario document SHALL contain a minimum of 17 unique scenarios covering all enumerated conditions in criteria 1 through 3, with each scenario traceable to a corresponding validation rule or endpoint behavior defined in Requirement 1 or Requirement 2

### Requirement 5: Detailed Test Cases Document

**User Story:** As a QA Engineer, I want a structured test case document with at least 20 test cases, so that I can track test execution and results systematically.

#### Acceptance Criteria

1. THE Project_Documentation SHALL contain at least 20 test cases distributed as a minimum of 9 for POST operations, a minimum of 4 for GET operations, and a minimum of 4 for DELETE operations
2. WHEN documenting each test case, THE Project_Documentation SHALL include the following columns: Test Case ID, Module, Scenario, Preconditions, Test Steps (numbered sequential actions), Test Data (specific request payload or parameters), Expected Result (HTTP status code and response behavior), Actual Result, and Status (one of: Pass, Fail, Not Executed, or Blocked)
3. THE Project_Documentation SHALL include at least 3 positive test cases (successful registration with all fields, get existing user, delete existing user) and at least 10 negative test cases covering invalid inputs, duplicate data, and non-existing resources as defined in the functional test scenarios
4. THE Project_Documentation SHALL assign unique Test Case IDs following the format TC_REG_001, TC_GET_001, TC_DEL_001 corresponding to the module
5. WHEN documenting test steps for each test case, THE Project_Documentation SHALL specify at least 2 sequential steps including the API request action and the response validation action

### Requirement 6: Playwright API Testing Automation Framework Structure

**User Story:** As a QA Engineer, I want a well-structured Playwright API Testing automation framework, so that I can maintain and extend API test automation efficiently.

#### Acceptance Criteria

1. THE Test_Framework SHALL use TypeScript, Node.js, @playwright/test, Winston logger, and optional Allure integration as core dependencies defined in package.json with pinned version numbers for each dependency
2. THE Test_Framework SHALL organize source code with the following directory structure: `tests/` (test spec files), `utils/` (helper utilities), `models/` (TypeScript interfaces and types), `config/` (configuration files), and `fixtures/` (Playwright fixtures and custom setup)
3. THE Test_Framework SHALL include a `fixtures/` directory containing a custom Playwright fixture that creates a configured APIRequestContext with the base URL loaded from an external configuration file and default headers set to Content-Type application/json, with request/response logging enabled for all requests
4. THE Test_Framework SHALL include a `tests/` directory containing Playwright test spec files with at least 2 positive test scenarios (successful operations) and at least 2 negative test scenarios (invalid input or resource-not-found cases) per API resource
5. THE Test_Framework SHALL include a `models/` directory containing TypeScript interfaces representing the User_Model and Address model with typed properties for all fields, used for request body construction and response type assertions
6. THE Test_Framework SHALL include a `utils/` directory containing a configuration reader module that loads settings from the external configuration file, a test data generation module that produces randomized valid test input using a library such as faker.js, and an assertion helper module that provides reusable response validation functions for status code and response body field verification
7. THE Test_Framework SHALL include a `config/` directory containing a configuration file (JSON or .env format) with at minimum the base URL and environment-specific settings as key-value pairs
8. THE Test_Framework SHALL include a `playwright.config.ts` file at the project root that configures the Playwright test runner with the API testing project, reporter settings (HTML reporter and optional Allure reporter), timeout settings, and retry configuration
9. WHEN a developer executes `npx playwright test` from the project root, THE Test_Framework SHALL compile without errors, execute all Playwright test specs, and generate an HTML report in the `playwright-report` directory
10. THE Test_Framework SHALL include a `fixtures/` directory containing a Playwright fixture that integrates with optional Allure reporting to capture test pass, fail, and skip events with metadata attachments for request/response details

### Requirement 7: Positive Automation Test Cases

**User Story:** As a QA Engineer, I want automated positive test cases, so that I can validate that the API functions correctly for valid inputs.

#### Acceptance Criteria

1. WHEN executing a positive POST test with all valid fields (firstName, lastName, email, phoneNumber, password, confirmPassword, dateOfBirth, age, gender, nationality, employeeId, isActive, address with addressLine1, addressLine2, city, state, country, and skills), THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 201, response body contains all submitted field values and a generated user ID, response time is below 2000 milliseconds, and Content-Type header is application/json
2. WHEN executing a positive POST test with mandatory fields only (firstName, lastName, email, phoneNumber, password, confirmPassword, age, and address), THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 201, response body contains the submitted mandatory field values and a generated user ID, and optional fields are either absent or null in the response
3. WHEN executing a positive GET test, THE Test_Framework SHALL first create a user via POST using APIRequestContext, then request GET `/api/users/{id}` using the returned user ID, and validate that the response status code is 200, response body fields match the originally submitted registration data, and Content-Type header is application/json
4. WHEN executing a positive DELETE test, THE Test_Framework SHALL first create a user via POST using APIRequestContext, then request DELETE `/api/users/{id}` using the returned user ID, and validate that the response status code is 200 and response body contains a message confirming the user was deleted
5. WHEN executing positive tests, THE Test_Framework SHALL validate the response against TypeScript interface definitions that verify field presence, field data types, and required fields for each endpoint (POST, GET, DELETE)
6. WHEN a positive POST test completes successfully, THE Test_Framework SHALL verify that a subsequent GET request using APIRequestContext for the created user ID returns the same user data that was submitted in the POST request

### Requirement 8: Negative Automation Test Cases

**User Story:** As a QA Engineer, I want automated negative test cases, so that I can validate the API handles invalid inputs and error conditions correctly.

#### Acceptance Criteria

1. WHEN executing a negative POST test with an invalid email format, THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 400, response body contains the email validation error message, response time is below 2000 milliseconds, and Content-Type header is application/json
2. WHEN executing a negative POST test with a duplicate email where a user with that email already exists in the In_Memory_Store, THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 409, response body contains the duplicate email error message, and Content-Type header is application/json
3. WHEN executing a negative POST test with an empty firstName, THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 400, response body contains the firstName required validation message, and Content-Type header is application/json
4. WHEN executing a negative POST test with mismatched password and confirmPassword, THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 400, response body contains the password mismatch error message, and Content-Type header is application/json
5. WHEN executing a negative POST test with all mandatory fields (firstName, lastName, email, and address) missing from the request body, THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 400 and response body contains a separate validation error message for each missing mandatory field
6. WHEN executing a negative GET test with an invalid user ID format, THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 400, response body contains the invalid ID error message, and Content-Type header is application/json
7. WHEN executing a negative GET test with a non-existing numeric user ID, THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 404, response body contains the user not found error message, and Content-Type header is application/json
8. WHEN executing a negative DELETE test with an invalid user ID format, THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 400, response body contains the invalid ID error message, and Content-Type header is application/json
9. WHEN executing a negative DELETE test with a non-existing numeric user ID, THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 404, response body contains the user not found error message, and Content-Type header is application/json
10. WHEN executing a negative POST test with a phoneNumber that is not exactly 10 digits, THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 400 and response body contains the invalid phone number validation error message
11. WHEN executing a negative POST test with an age value below 18, THE Test_Framework SHALL validate using Playwright APIRequestContext that the response status code is 400 and response body contains a validation error message indicating age must be at least 18

### Requirement 9: Test Reporting and Execution

**User Story:** As a QA Engineer, I want comprehensive test reports and execution logs, so that I can analyze test results and share them with stakeholders.

#### Acceptance Criteria

1. WHEN tests are executed via Playwright, THE Test_Framework SHALL generate a Playwright HTML report in the `playwright-report` directory containing results for all executed test cases
2. WHEN tests are executed via Playwright with optional Allure integration enabled, THE Test_Framework SHALL generate Allure Report data in the `allure-results` directory containing results for all executed test cases
3. THE Test_Framework SHALL provide an npm command `npx playwright test` for executing all test cases
4. THE Test_Framework SHALL provide a command `npx playwright show-report` for viewing the Playwright_Report in a browser, and optionally `allure serve allure-results` for viewing Allure reports
5. WHILE tests are executing, THE Test_Framework SHALL log execution details (request URL, request body, response status, response body) using Winston logger to both console and a log file located in a `logs` directory with a filename that includes the execution date
6. THE Test_Report SHALL display for each test case: pass/fail status, execution time in milliseconds, and for failed tests the error message and stack trace
7. IF report generation fails during test execution, THEN THE Test_Framework SHALL log an error message indicating the failure reason without preventing the remaining tests from executing

### Requirement 10: Project Documentation

**User Story:** As a QA Engineer, I want professional project documentation, so that I can present the complete testing project in a structured report format.

#### Acceptance Criteria

1. THE Project_Documentation SHALL include the following sections, each containing at least one paragraph of descriptive content: Objective, Scope, Tools Used, API Endpoints Description, Test Approach, Functional Test Scenarios, Test Cases Table, Automation Framework Design, Execution Results Summary, Defects Found, and Conclusion
2. THE Project_Documentation SHALL describe each tool in the technology stack (TypeScript, Node.js, Express.js, npm, In-Memory Store, Playwright Test, Winston, Playwright HTML Reporter, optional Allure Reports, and Postman) with its name, purpose in the project, and version used
3. THE Project_Documentation SHALL include a framework architecture diagram or textual description that identifies the directory structure (tests/, utils/, models/, config/, fixtures/) and shows the dependency relationships between test components, utilities, and configuration layers
4. THE Project_Documentation SHALL provide setup instructions that include prerequisite software with minimum required versions (Node.js, npm, Postman), numbered steps to start the API application using npm scripts, and numbered steps to execute the test suite using npx playwright test
5. THE Project_Documentation SHALL include a summary of test execution results showing total test cases, passed count, failed count, and pass percentage
6. THE Project_Documentation SHALL be formatted in Markdown with a table of contents listing all section headings as navigable links
7. THE Project_Documentation SHALL include a Test Cases Table with columns for: Test Case ID, Test Scenario, HTTP Method, Endpoint, Expected Status Code, and Pass/Fail Result

import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../../models/api-response.model';

/**
 * Validation chain for user registration requests.
 * Validates all required fields per the User_Model specification.
 */
export const registerValidation = [
  // firstName: required, non-empty, max 50 chars
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('firstName is required')
    .isLength({ max: 50 })
    .withMessage('firstName must not exceed 50 characters'),

  // lastName: required, non-empty, max 50 chars
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('lastName is required')
    .isLength({ max: 50 })
    .withMessage('lastName must not exceed 50 characters'),

  // email: required, non-empty, valid email format, max 100 chars
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 100 })
    .withMessage('email must not exceed 100 characters'),

  // phoneNumber: exactly 10 numeric digits
  body('phoneNumber')
    .notEmpty()
    .withMessage('phoneNumber is required')
    .matches(/^\d{10}$/)
    .withMessage('phoneNumber must be exactly 10 digits'),

  // password: min 8, max 128 chars
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('password must be between 8 and 128 characters'),

  // confirmPassword: must match password
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('confirmPassword must match password');
      }
      return true;
    }),

  // age: required, integer between 18 and 150
  body('age')
    .notEmpty()
    .withMessage('age is required')
    .isInt({ min: 18, max: 150 })
    .withMessage('age must be between 18 and 150'),

  // address: required object with required sub-fields
  body('address')
    .exists({ checkNull: true })
    .withMessage('address is required'),

  body('address.addressLine1')
    .notEmpty()
    .withMessage('address.addressLine1 is required'),

  body('address.city')
    .notEmpty()
    .withMessage('address.city is required'),

  body('address.state')
    .notEmpty()
    .withMessage('address.state is required'),

  body('address.country')
    .notEmpty()
    .withMessage('address.country is required'),
];

/**
 * Validation chain for path parameter :id.
 * Validates that the ID is a positive integer.
 */
export const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
];

/**
 * Middleware that collects all validation errors and returns them
 * in a single 400 response following the ErrorResponse interface.
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorResponse: ErrorResponse = {
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map((error) => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
      })),
    };

    res.status(400).json(errorResponse);
    return;
  }

  next();
};

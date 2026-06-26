import { Router } from 'express';
import {
  registerValidation,
  idValidation,
  handleValidationErrors,
} from '../middleware/validation';
import { createUser, getUser, deleteUser } from '../controllers/user.controller';

const router = Router();

// POST /register — create a new user
router.post(
  '/register',
  [...registerValidation, handleValidationErrors],
  createUser
);

// GET /:id — retrieve a user by ID
router.get(
  '/:id',
  [...idValidation, handleValidationErrors],
  getUser
);

// DELETE /:id — delete a user by ID
router.delete(
  '/:id',
  [...idValidation, handleValidationErrors],
  deleteUser
);

export default router;

import { Request, Response } from 'express';
import { userStore } from '../store/user.store';

/**
 * Create a new user.
 * Checks email uniqueness (case-insensitive), assigns ID, persists, and returns 201.
 * Returns 409 if email already exists.
 */
export function createUser(req: Request, res: Response): void {
  const { confirmPassword, ...userData } = req.body;

  // Check email uniqueness (case-insensitive)
  if (userStore.existsByEmail(userData.email)) {
    res.status(409).json({
      status: 'error',
      message: 'Email already exists',
      errors: [{ field: 'email', message: 'A user with this email already exists' }]
    });
    return;
  }

  // Persist the user (store assigns the ID)
  const createdUser = userStore.add(userData);

  res.status(201).json({
    status: 'success',
    data: createdUser,
    message: 'User registered successfully'
  });
}

/**
 * Get a user by ID.
 * Returns 200 with user data or 404 if not found.
 */
export function getUser(req: Request, res: Response): void {
  const id = parseInt(req.params.id, 10);

  const user = userStore.getById(id);

  if (user) {
    res.status(200).json({
      status: 'success',
      data: user
    });
  } else {
    res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
}

/**
 * Delete a user by ID.
 * Returns 200 if deleted or 404 if not found.
 */
export function deleteUser(req: Request, res: Response): void {
  const id = parseInt(req.params.id, 10);

  const deleted = userStore.deleteById(id);

  if (deleted) {
    res.status(200).json({
      status: 'success',
      data: null,
      message: 'User deleted successfully'
    });
  } else {
    res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
}

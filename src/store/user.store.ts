import { User } from '../../models/user.model';

/**
 * In-memory user store using a Map with auto-incrementing numeric IDs.
 * This is a singleton module-level instance.
 */
class UserStore {
  private store: Map<number, User> = new Map();
  private nextId: number = 1;

  /**
   * Add a new user to the store. Assigns an auto-incremented ID.
   * @param user - User object without the id field
   * @returns The stored user with the assigned id
   */
  add(user: Omit<User, 'id'>): User {
    const newUser: User = { ...user, id: this.nextId };
    this.store.set(this.nextId, newUser);
    this.nextId++;
    return newUser;
  }

  /**
   * Retrieve a user by their numeric ID.
   * @param id - The user's ID
   * @returns The user if found, otherwise undefined
   */
  getById(id: number): User | undefined {
    return this.store.get(id);
  }

  /**
   * Delete a user by their numeric ID.
   * @param id - The user's ID
   * @returns true if the user was deleted, false if not found
   */
  deleteById(id: number): boolean {
    return this.store.delete(id);
  }

  /**
   * Check if a user with the given email already exists (case-insensitive).
   * @param email - The email address to check
   * @returns true if a user with that email exists
   */
  existsByEmail(email: string): boolean {
    const normalizedEmail = email.toLowerCase();
    for (const user of this.store.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return true;
      }
    }
    return false;
  }
}

/** Singleton instance of the UserStore */
export const userStore = new UserStore();

/**
 * Simple in-memory user store
 * In production, this would be replaced with a real database
 */

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

// Global user store
const userStore = new Map<string, StoredUser>();

export const UserStore = {
  /**
   * Create a new user
   */
  create(user: StoredUser): StoredUser {
    console.log(`[UserStore] Creating user: ${user.email}`);
    userStore.set(user.email, user);
    console.log(`[UserStore] User created. Total users: ${userStore.size}`);
    return user;
  },

  /**
   * Find user by email
   */
  findByEmail(email: string): StoredUser | undefined {
    console.log(`[UserStore] Finding user by email: ${email}`);
    const user = userStore.get(email);
    console.log(`[UserStore] User found: ${user ? "yes" : "no"}`);
    return user;
  },

  /**
   * Check if email exists
   */
  emailExists(email: string): boolean {
    return userStore.has(email);
  },

  /**
   * Get all users (for debugging)
   */
  getAll(): StoredUser[] {
    return Array.from(userStore.values());
  },

  /**
   * Clear all users (for testing)
   */
  clear(): void {
    userStore.clear();
  },

  /**
   * Get store size
   */
  size(): number {
    return userStore.size;
  },
};

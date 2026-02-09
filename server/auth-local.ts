import bcryptjs from "bcryptjs";

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Senha deve ter pelo menos 6 caracteres");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Senha deve conter letras minúsculas");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Senha deve conter letras maiúsculas");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Senha deve conter números");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

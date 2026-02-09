import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  hashPassword,
  comparePassword,
  validateEmail,
  validatePassword,
} from "./auth-local";
import {
  getUserByEmail,
  createUser,
  emailExists,
} from "./user-storage";
import { TRPCError } from "@trpc/server";

export const authLocalRouter = router({
  /**
   * Sign up with email and password
   */
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Validate email format
      if (!validateEmail(input.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email inválido",
        });
      }

      // Validate password strength
      const passwordValidation = validatePassword(input.password);
      if (!passwordValidation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: passwordValidation.errors.join(", "),
        });
      }

      // Check if email already exists
      if (emailExists(input.email)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email já cadastrado",
        });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Create user
      const userId = `user-${Date.now()}`;
      const user = createUser({
        id: userId,
        email: input.email,
        name: input.name,
        passwordHash,
        createdAt: new Date().toISOString(),
      });

      console.log(`[Auth] User created: ${input.email}`);

      return {
        success: true,
        message: "Conta criada com sucesso",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),

  /**
   * Login with email and password
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log(`[Auth] Login attempt: ${input.email}`);

      // Find user by email
      const user = getUserByEmail(input.email);

      if (!user) {
        console.log(`[Auth] User not found: ${input.email}`);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Compare password
      const passwordMatch = await comparePassword(
        input.password,
        user.passwordHash
      );

      if (!passwordMatch) {
        console.log(`[Auth] Password mismatch for: ${input.email}`);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      console.log(`[Auth] Login successful: ${input.email}`);

      return {
        success: true,
        message: "Login realizado com sucesso",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),

  /**
   * Check if email is available
   */
  checkEmailAvailable: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(({ input }) => {
      const exists = emailExists(input.email);
      return {
        available: !exists,
      };
    }),
});

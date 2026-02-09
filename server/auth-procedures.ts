import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  hashPassword,
  comparePassword,
  validateEmail,
  validatePassword,
} from "./auth-local";
import { UserStore } from "./user-store";
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
      console.log(`[Auth Signup] Starting signup for: ${input.email}`);

      // Validate email format
      if (!validateEmail(input.email)) {
        console.log(`[Auth Signup] Invalid email format: ${input.email}`);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email inválido",
        });
      }

      // Validate password strength
      const passwordValidation = validatePassword(input.password);
      if (!passwordValidation.valid) {
        console.log(
          `[Auth Signup] Invalid password for: ${input.email}`,
          passwordValidation.errors
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: passwordValidation.errors.join(", "),
        });
      }

      // Check if email already exists
      if (UserStore.emailExists(input.email)) {
        console.log(`[Auth Signup] Email already exists: ${input.email}`);
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email já cadastrado",
        });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);
      console.log(`[Auth Signup] Password hashed for: ${input.email}`);

      // Create user
      const userId = `user-${Date.now()}`;
      const user = UserStore.create({
        id: userId,
        email: input.email,
        name: input.name,
        passwordHash,
        createdAt: new Date(),
      });

      console.log(`[Auth Signup] User created successfully: ${input.email}`);
      console.log(`[Auth Signup] Total users in store: ${UserStore.size()}`);

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
      console.log(`[Auth Login] Starting login for: ${input.email}`);
      console.log(`[Auth Login] Total users in store: ${UserStore.size()}`);
      console.log(
        `[Auth Login] All users: ${UserStore.getAll()
          .map((u) => u.email)
          .join(", ")}`
      );

      // Find user by email
      const user = UserStore.findByEmail(input.email);

      if (!user) {
        console.log(`[Auth Login] User not found: ${input.email}`);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      console.log(`[Auth Login] User found, comparing passwords...`);

      // Compare password
      const passwordMatch = await comparePassword(
        input.password,
        user.passwordHash
      );

      if (!passwordMatch) {
        console.log(`[Auth Login] Password mismatch for: ${input.email}`);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      console.log(`[Auth Login] Login successful: ${input.email}`);

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
      const exists = UserStore.emailExists(input.email);
      console.log(
        `[Auth Check] Email availability for ${input.email}: ${!exists}`
      );
      return {
        available: !exists,
      };
    }),

  /**
   * Debug: Get all users (remove in production)
   */
  debug_getAllUsers: publicProcedure.query(() => {
    const users = UserStore.getAll();
    return {
      count: users.length,
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
      })),
    };
  }),
});

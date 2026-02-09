import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  hashPassword,
  comparePassword,
  validateEmail,
  validatePassword,
} from "./auth-local";
import { TRPCError } from "@trpc/server";

// Mock database for users - em produção, usar banco de dados real
const users: Map<
  string,
  {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    createdAt: Date;
  }
> = new Map();

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
      const existingUser = Array.from(users.values()).find(
        (u) => u.email === input.email
      );
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email já cadastrado",
        });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Create user
      const userId = `user-${Date.now()}`;
      users.set(userId, {
        id: userId,
        email: input.email,
        name: input.name,
        passwordHash,
        createdAt: new Date(),
      });

      return {
        success: true,
        message: "Conta criada com sucesso",
        user: {
          id: userId,
          email: input.email,
          name: input.name,
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
      // Find user by email
      const user = Array.from(users.values()).find(
        (u) => u.email === input.email
      );

      if (!user) {
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
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

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
      const exists = Array.from(users.values()).some(
        (u) => u.email === input.email
      );
      return {
        available: !exists,
      };
    }),
});

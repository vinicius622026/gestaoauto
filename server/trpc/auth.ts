/**
 * Auth router skeleton (Phase 2 start)
 *
 * This file provides placeholder implementations for the 10 auth routes
 * we will implement fully: signUp, signIn, signOut, requestPasswordReset,
 * resetPassword, getSession, refreshSession, verifyEmail, sendVerificationEmail,
 * getCurrentUser.
 *
 * Each function currently throws `NotImplemented` and documents the expected
 * input/output shape. We'll replace these with real tRPC procedures wired to
 * the database and email provider in subsequent steps.
 */

import { createLocalUser, verifyLocalUser, setLocalPassword } from "../auth/localAuth";
import { upsertUser, getUserByOpenId } from "../db";
import { SignJWT, jwtVerify } from "jose";
import { createToken, verifyAndConsumeToken } from "../auth/tokens";
import { sendEmail } from "../auth/mailer";

type SignUpInput = { email: string; password: string; name?: string };
type SignInInput = { email: string; password: string };

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret";

async function signToken(payload: object) {
  const alg = "HS256" as const;
  // Use jose SignJWT instead (node built-in subtle isn't always available in older runtimes)
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(Buffer.from(JWT_SECRET));
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, Buffer.from(JWT_SECRET));
    return payload as Record<string, any>;
  } catch (err) {
    return null;
  }
}

export const authRouter = {
  async signUp(input: SignUpInput) {
    const email = input.email.toLowerCase().trim();
    await createLocalUser(email, input.password);

    // also upsert into users table using openId to identify local accounts
    await upsertUser({ openId: `local:${email}`, email, name: input.name });

    const token = await signToken({ sub: `local:${email}`, email });
    const refreshToken = await createToken(email, "refresh", 60 * 24 * 30);
    return { token, refreshToken };
  },

  async signIn(input: SignInInput) {
    const email = input.email.toLowerCase().trim();
    const ok = await verifyLocalUser(email, input.password);
    if (!ok) throw new Error("Invalid credentials");
    const token = await signToken({ sub: `local:${email}`, email });
    const refreshToken = await createToken(email, "refresh", 60 * 24 * 30);
    return { token, refreshToken };
  },

  async getCurrentUser({ token }: { token?: string | null }) {
    if (!token) return null;
    const payload = await verifyToken(token);
    if (!payload) return null;

    const sub = payload.sub as string;
    if (!sub) return null;

    const user = await getUserByOpenId(sub);
    if (!user) {
      // fallback: try local user mapping
      const email = payload.email as string | undefined;
      if (!email) return null;
      return { openId: `local:${email}`, email };
    }

    return user;
  },

  async getSession({ token }: { token?: string | null }) {
    if (!token) return null;
    const payload = await verifyToken(token);
    return payload;
  },

  async refreshSession({ refreshToken }: { refreshToken: string }) {
    const email = await verifyAndConsumeToken(refreshToken, "refresh");
    if (!email) throw new Error("Invalid refresh token");

    const token = await signToken({ sub: `local:${email}`, email });
    const newRefresh = await createToken(email, "refresh", 60 * 24 * 30);
    return { token, refreshToken: newRefresh };
  },

  async signOut({ refreshToken }: { refreshToken?: string | null }) {
    if (refreshToken) {
      try {
        await verifyAndConsumeToken(refreshToken, "refresh");
      } catch (err) {
        // ignore
      }
    }
    return { ok: true };
  },

  async verifyEmail(input: { token: string }) {
    const email = await verifyAndConsumeToken(input.token, "verify_email");
    if (!email) throw new Error("Invalid or expired token");

    // ensure user exists
    await upsertUser({ openId: `local:${email}`, email });
    return { ok: true };
  },

  async requestPasswordReset(input: { email: string }) {
    const email = input.email.toLowerCase().trim();
    const token = await createToken(email, "password_reset", 60);
    const link = `${process.env.PROJECT_URL ?? "http://localhost:3000"}/auth/reset?token=${token}`;
    await sendEmail(email, "Reset your password", `Use this link to reset your password:\n${link}`);
    return { ok: true };
  },

  async resetPassword(input: { token: string; newPassword: string }) {
    const email = await verifyAndConsumeToken(input.token, "password_reset");
    if (!email) throw new Error("Invalid or expired token");

    await setLocalPassword(email, input.newPassword);
    return { ok: true };
  },

  async sendVerificationEmail(input: { email: string }) {
    const email = input.email.toLowerCase().trim();
    const token = await createToken(email, "verify_email", 60 * 24);
    const link = `${process.env.PROJECT_URL ?? "http://localhost:3000"}/auth/verify?token=${token}`;
    await sendEmail(email, "Verify your email", `Click to verify:\n${link}`);
    return { ok: true };
  },
};

export type AuthRouter = typeof authRouter;

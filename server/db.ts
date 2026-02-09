import { InsertUser, User, users } from "../drizzle/schema";
import { ENV } from './_core/env';

// Simple in-memory database for development
const usersStore = new Map<string, User>();

export async function getDb() {
  // Return a mock database object
  return {
    insert: () => ({
      values: async () => { },
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [],
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: async () => { },
      }),
    }),
  };
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      values[field] = value ?? null;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    // Store in memory
    const id = usersStore.size + 1;
    const storedUser: User = {
      id,
      openId: values.openId!,
      name: values.name || null,
      email: values.email || null,
      loginMethod: values.loginMethod || null,
      role: values.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: values.lastSignedIn || new Date(),
    };
    usersStore.set(user.openId, storedUser);
    console.log("[Database] Upserted user:", user.openId);
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const user = usersStore.get(openId);
  return user;
}

// TODO: add feature queries here as your schema grows.

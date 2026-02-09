import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), ".data", "users.json");

// Ensure .data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load users from file
function loadUsers(): Map<
  string,
  {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    createdAt: string;
  }
> {
  ensureDataDir();

  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      const users = JSON.parse(data);
      return new Map(Object.entries(users));
    }
  } catch (error) {
    console.error("[Storage] Error loading users:", error);
  }

  return new Map();
}

// Save users to file
function saveUsers(
  users: Map<
    string,
    {
      id: string;
      email: string;
      name: string;
      passwordHash: string;
      createdAt: string;
    }
  >
) {
  ensureDataDir();

  try {
    const data = Object.fromEntries(users);
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("[Storage] Error saving users:", error);
  }
}

// In-memory cache
let usersCache: Map<
  string,
  {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    createdAt: string;
  }
> | null = null;

// Get all users
export function getAllUsers() {
  if (!usersCache) {
    usersCache = loadUsers();
  }
  return usersCache;
}

// Get user by email
export function getUserByEmail(email: string) {
  const users = getAllUsers();
  return Array.from(users.values()).find((u) => u.email === email);
}

// Get user by ID
export function getUserById(id: string) {
  const users = getAllUsers();
  return users.get(id);
}

// Create user
export function createUser(user: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}) {
  const users = getAllUsers();
  users.set(user.id, user);
  saveUsers(users);
  return user;
}

// Check if email exists
export function emailExists(email: string): boolean {
  return getUserByEmail(email) !== undefined;
}

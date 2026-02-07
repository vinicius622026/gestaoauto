import postgres from "postgres";
import crypto from "crypto";

const TABLE_SQL = `
CREATE TABLE IF NOT EXISTS local_auth (
  id serial PRIMARY KEY,
  email varchar(320) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  salt text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
`;

type Row = { id: number; email: string; password_hash: string; salt: string };

const inMemory = new Map<string, { hash: string; salt: string }>();

function hashPassword(password: string, salt: string) {
  const derived = crypto.scryptSync(password, salt, 64);
  return derived.toString("hex");
}

function genSalt() {
  return crypto.randomBytes(16).toString("hex");
}

async function getSql() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });
    await sql.unsafe(TABLE_SQL);
    return sql;
  } catch (err) {
    console.warn("[localAuth] DB unavailable:", err);
    return null;
  }
}

export async function createLocalUser(email: string, password: string) {
  const salt = genSalt();
  const hash = hashPassword(password, salt);

  const sql = await getSql();
  if (!sql) {
    inMemory.set(email, { hash, salt });
    return { email };
  }

  const existing = await sql`SELECT id FROM local_auth WHERE email = ${email}`;
  if (existing.length > 0) {
    throw new Error("User already exists");
  }

  await sql`INSERT INTO local_auth (email, password_hash, salt) VALUES (${email}, ${hash}, ${salt})`;
  return { email };
}

export async function verifyLocalUser(email: string, password: string) {
  const sql = await getSql();
  if (!sql) {
    const entry = inMemory.get(email);
    if (!entry) return false;
    return hashPassword(password, entry.salt) === entry.hash;
  }

  const rows: Row[] = await sql`SELECT id, email, password_hash, salt FROM local_auth WHERE email = ${email}`;
  if (rows.length === 0) return false;

  const row = rows[0];
  return hashPassword(password, row.salt) === row.password_hash;
}

export async function ensureLocalAuthTable() {
  await getSql();
}

export async function setLocalPassword(email: string, newPassword: string) {
  const salt = genSalt();
  const hash = hashPassword(newPassword, salt);

  const sql = await getSql();
  if (!sql) {
    const entry = inMemory.get(email);
    if (!entry) throw new Error("User not found");
    inMemory.set(email, { hash, salt });
    return;
  }

  const rows = await sql`SELECT id FROM local_auth WHERE email = ${email}`;
  if (rows.length === 0) throw new Error("User not found");

  await sql`UPDATE local_auth SET password_hash = ${hash}, salt = ${salt} WHERE email = ${email}`;
}


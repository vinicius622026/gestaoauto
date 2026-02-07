import postgres from "postgres";

const TABLE_SQL = `
CREATE TABLE IF NOT EXISTS auth_tokens (
  id serial PRIMARY KEY,
  token varchar(255) NOT NULL UNIQUE,
  type varchar(50) NOT NULL,
  email varchar(320) NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
`;

type TokenRow = { token: string; type: string; email: string; expires_at: string };

const inMemory = new Map<string, { type: string; email: string; expiresAt: number }>();

function genToken() {
  return [...Array(30)]
    .map(() => Math.floor(Math.random() * 36).toString(36))
    .join("");
}

async function getSql() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });
    await sql.unsafe(TABLE_SQL);
    return sql;
  } catch (err) {
    console.warn("[tokens] DB unavailable:", err);
    return null;
  }
}

export async function createToken(email: string, type: string, expiresMinutes = 60) {
  const token = genToken();
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

  const sql = await getSql();
  if (!sql) {
    inMemory.set(token, { type, email, expiresAt: expiresAt.getTime() });
    return token;
  }

  await sql`INSERT INTO auth_tokens (token, type, email, expires_at) VALUES (${token}, ${type}, ${email}, ${expiresAt.toISOString()})`;
  return token;
}

export async function verifyAndConsumeToken(token: string, type: string) {
  const sql = await getSql();
  if (!sql) {
    const entry = inMemory.get(token);
    if (!entry) return null;
    if (entry.type !== type) return null;
    if (Date.now() > entry.expiresAt) {
      inMemory.delete(token);
      return null;
    }
    // consume
    inMemory.delete(token);
    return entry.email;
  }

  const rows: TokenRow[] = await sql`SELECT token, type, email, expires_at FROM auth_tokens WHERE token = ${token} AND type = ${type}`;
  if (rows.length === 0) return null;
  const row = rows[0];
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await sql`DELETE FROM auth_tokens WHERE token = ${token}`;
    return null;
  }

  // consume
  await sql`DELETE FROM auth_tokens WHERE token = ${token}`;
  return row.email;
}

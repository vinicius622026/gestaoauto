#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import postgres from 'postgres';

async function main() {
  const sqlDir = path.resolve(process.cwd(), 'drizzle');
  const files = await fs.readdir(sqlDir);
  const sqlFiles = files.filter((f) => f.endsWith('.sql')).sort();

  if (sqlFiles.length === 0) {
    console.log('No SQL migration files found in drizzle/');
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  // Sanitize URL: ensure password is percent-encoded so URL parser accepts it
  const sanitizeDatabaseUrl = (url) => {
    try {
      const idx = url.indexOf('//');
      if (idx === -1) return url;
      const start = idx + 2;
      const at = url.indexOf('@', start);
      if (at === -1) return url;
      const userinfo = url.slice(start, at);
      const colon = userinfo.indexOf(':');
      if (colon === -1) return url;
      const user = userinfo.slice(0, colon);
      const pass = userinfo.slice(colon + 1);
      const encoded = `${user}:${encodeURIComponent(pass)}`;
      return url.slice(0, start) + encoded + url.slice(at);
    } catch (e) {
      return url;
    }
  };

  const sanitized = sanitizeDatabaseUrl(databaseUrl);
  const sql = postgres(sanitized, { ssl: 'require' });

  try {
    for (const file of sqlFiles) {
      const full = path.join(sqlDir, file);
      console.log('Applying', file);
      const contents = await fs.readFile(full, 'utf8');
      // Execute the SQL file as a single command. Many CREATE statements
      // are self-contained and will run fine. If a file contains multiple
      // statements separated by semicolon, the postgres client will
      // execute them sequentially.
      await sql.unsafe(contents);
    }

    console.log('Migrations applied successfully');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5_000 });
  }
}

main();

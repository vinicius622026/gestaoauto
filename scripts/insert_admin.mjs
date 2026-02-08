#!/usr/bin/env node
import { Client } from 'pg';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--openId' && args[i+1]) { out.openId = args[++i]; }
    else if (a === '--name' && args[i+1]) { out.name = args[++i]; }
    else if (a === '--email' && args[i+1]) { out.email = args[++i]; }
    else if (a === '--confirm') { out.confirm = true; }
    else if (a === '--help') { out.help = true; }
  }
  return out;
}

const opts = parseArgs();
if (opts.help) {
  console.log('Usage: node scripts/insert_admin.mjs [--openId id] [--name "Name"] [--email email] [--confirm]');
  process.exit(0);
}

const openId = opts.openId || 'e2e-admin';
const name = opts.name || 'E2E Admin';
const email = opts.email || 'e2e-admin@example.com';

if (!opts.confirm) {
  console.log('Dry run. To execute, re-run with --confirm');
  console.log('Values:', { openId, name, email });
  console.log('\nSQL: scripts/insert_admin.sql');
  process.exit(0);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set in environment');
  process.exit(2);
}

async function run() {
  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    const sql = `INSERT INTO users ("openId","name","email","role","createdAt","updatedAt","lastSignedIn") VALUES ($1,$2,$3,'admin',NOW(),NOW(),NOW()) ON CONFLICT ("openId") DO UPDATE SET "role"='admin', "name"=EXCLUDED."name", "email"=EXCLUDED."email", "updatedAt"=NOW() RETURNING *;`;
    const res = await client.query(sql, [openId, name, email]);
    console.log('Upsert result:');
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error('Error inserting admin:', err?.message || err);
    process.exitCode = 3;
  } finally {
    await client.end();
  }
}

run();

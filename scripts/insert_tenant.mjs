#!/usr/bin/env node
import { Client } from 'pg';

function usage() {
  console.log(`Usage: node scripts/insert_tenant.mjs --subdomain=<sub> --name=<name> [--email=<email>] [--phone=<phone>] [--website=<url>] [--confirm]

Options:
  --confirm   Actually run the insert. Without this flag the script prints the SQL and exits.
`);
}

const argv = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k,v] = a.split(/=(.*)/s);
  return [k.replace(/^--/,'') , v===undefined ? true : v];
}));

if(!argv.subdomain || !argv.name) {
  usage();
  process.exit(1);
}

const values = [
  argv.subdomain,
  argv.name,
  argv.description || null,
  argv.email || null,
  argv.phone || null,
  argv.logoUrl || null,
  argv.address || null,
  argv.city || null,
  argv.state || null,
  argv.zipCode || null,
  argv.website || null,
  argv.isActive === 'false' ? false : true
];

const sql = `INSERT INTO "tenants" (
  "subdomain", "name", "description", "email", "phone", "logoUrl", "address", "city", "state", "zipCode", "website", "isActive"
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
) RETURNING *;`;

console.log('SQL to run:\n');
console.log(sql);
console.log('\nValues:', JSON.stringify(values, null, 2));

if(!argv.confirm) {
  console.log('\nScript is in dry-run mode. Re-run with --confirm to execute.');
  process.exit(0);
}

const databaseUrl = process.env.DATABASE_URL;
if(!databaseUrl) {
  console.error('DATABASE_URL is not set. Aborting.');
  process.exit(2);
}

const client = new Client({ connectionString: databaseUrl });

try {
  await client.connect();
  const res = await client.query(sql, values);
  console.log('Inserted tenant:', res.rows[0]);
  await client.end();
  process.exit(0);
} catch (err) {
  console.error('Error inserting tenant:', err.message || err);
  try { await client.end(); } catch(e){}
  process.exit(3);
}

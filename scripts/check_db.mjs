#!/usr/bin/env node
import postgres from 'postgres';

const queries = {
  tables: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`,
  enums: `SELECT t.typname AS enum_name, array_agg(e.enumlabel ORDER BY e.enumsortorder) AS labels
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname IN ('role_enum','profile_role_enum')
GROUP BY t.typname;`,
  users_cols: `SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='users'
ORDER BY ordinal_position;`,
  counts: `SELECT 'users' AS table_name, COUNT(*) AS cnt FROM "users"
UNION ALL
SELECT 'tenants', COUNT(*) FROM "tenants"
UNION ALL
SELECT 'vehicles', COUNT(*) FROM "vehicles"
UNION ALL
SELECT 'images', COUNT(*) FROM "images"
UNION ALL
SELECT 'profiles', COUNT(*) FROM "profiles"
UNION ALL
SELECT 'apiKeys', COUNT(*) FROM "apiKeys"
UNION ALL
SELECT 'webhookEvents', COUNT(*) FROM "webhookEvents"
UNION ALL
SELECT 'webhooks', COUNT(*) FROM "webhooks"
UNION ALL
SELECT 'whatsappLeads', COUNT(*) FROM "whatsappLeads";`,
  pk_uniques: `SELECT tc.table_name, tc.constraint_type, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu USING (constraint_name, table_schema, table_name)
WHERE tc.table_schema='public' AND tc.constraint_type IN ('PRIMARY KEY','UNIQUE')
ORDER BY tc.table_name, tc.constraint_type;`,
  fks: `SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu USING (constraint_name, table_schema, table_name)
JOIN information_schema.constraint_column_usage ccu USING (constraint_name, table_schema)
WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public';`,
  sample_vehicles: `SELECT v.id, v.make, v.model, v.year, t.subdomain AS tenant
FROM "vehicles" v
LEFT JOIN "tenants" t ON v."tenantId" = t.id
ORDER BY v.id
LIMIT 20;`,
};

function sanitizeDatabaseUrl(url) {
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
}

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set in env');
    process.exit(1);
  }

  const sqlUrl = sanitizeDatabaseUrl(databaseUrl);
  const sql = postgres(sqlUrl, { ssl: 'require' });

  try {
    for (const [name, q] of Object.entries(queries)) {
      console.log('---', name, '---');
      const res = await sql.unsafe(q);
      console.log(JSON.stringify(res, null, 2));
    }
  } catch (err) {
    console.error('Query error:', err.message || err);
  } finally {
    await sql.end({ timeout: 2000 });
  }
}

run();

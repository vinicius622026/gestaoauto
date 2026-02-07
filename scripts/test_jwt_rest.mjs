#!/usr/bin/env node
import { SignJWT } from 'jose';

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  if (!supabaseUrl || !jwtSecret) {
    console.error('VITE_SUPABASE_URL or JWT_SECRET missing in env');
    process.exit(1);
  }

  // create HS256 JWT signed with project secret
  const encoder = new TextEncoder();
  const key = encoder.encode(jwtSecret);

  const jwt = await new SignJWT({ role: 'anon' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);

  console.log('Generated JWT (first 40 chars):', jwt.slice(0, 40) + '...');

  const url = `${supabaseUrl.replace(/\/+$/,'')}/rest/v1/tenants?select=*`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        apikey: anonKey || '',
        Accept: 'application/json'
      }
    });

    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (e) {
    console.error('Request failed:', e.message || e);
  }
}

main();

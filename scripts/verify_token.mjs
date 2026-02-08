#!/usr/bin/env node
import { jwtVerify } from 'jose';

const token = process.argv[2];
const secret = process.env.JWT_SECRET;

if (!token) {
  console.error('Usage: JWT_TOKEN as first arg');
  process.exit(2);
}
if (!secret) {
  console.error('JWT_SECRET environment variable not set');
  process.exit(2);
}

async function main() {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    console.log('Verified payload:');
    console.log(JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error('Verification failed:', String(err));
    process.exit(3);
  }
}

main();

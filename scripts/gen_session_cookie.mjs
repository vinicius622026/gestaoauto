#!/usr/bin/env node
import { SignJWT } from 'jose';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--openId' && args[i+1]) { out.openId = args[++i]; }
    else if (a === '--name' && args[i+1]) { out.name = args[++i]; }
    else if (a === '--appId' && args[i+1]) { out.appId = args[++i]; }
    else if (a === '--expiresDays' && args[i+1]) { out.expiresDays = Number(args[++i]); }
    else if (a === '--help') { out.help = true; }
  }
  return out;
}

const opts = parseArgs();
if (opts.help) {
  console.log('Usage: node scripts/gen_session_cookie.mjs --openId id --name "Name" --appId app --expiresDays 365');
  process.exit(0);
}

const openId = opts.openId || 'e2e-admin';
const name = opts.name || 'E2E Admin';
const appId = opts.appId || process.env.VITE_APP_ID || 'e2e-app';
const expiresDays = opts.expiresDays || 365;

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET not set in environment');
  process.exit(2);
}

async function gen() {
  const issuedAt = Date.now();
  const expiresInMs = expiresDays * 24 * 60 * 60 * 1000;
  const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
  const secretKey = new TextEncoder().encode(secret);

  const token = await new SignJWT({ openId, appId, name })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);

  const cookieName = 'app_session_id';
  console.log('Cookie name:', cookieName);
  console.log('Cookie value:', token);
  console.log('\nPlaywright example to set cookie:');
  console.log(`page.context().addCookies([{ name: '${cookieName}', value: '${token}', domain: 'localhost', path: '/', httpOnly: true, sameSite: 'None', secure: false }])`);
}

gen();

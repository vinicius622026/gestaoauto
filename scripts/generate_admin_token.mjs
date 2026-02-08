#!/usr/bin/env node
import { SignJWT } from 'jose';

const secret = process.env.JWT_SECRET;
const appId = process.env.VITE_APP_ID || 'e2e-app';
const openId = process.env.ADMIN_OPEN_ID || 'e2e-admin';
const name = process.env.ADMIN_NAME || 'E2E Admin';
const expiresMs = Number(process.env.JWT_EXPIRES_MS || 1000 * 60 * 60 * 24 * 365);

if (!secret) {
  console.error('Defina JWT_SECRET antes de gerar o token.');
  process.exit(2);
}

async function main() {
  const key = new TextEncoder().encode(secret);
  const expSeconds = Math.floor((Date.now() + expiresMs) / 1000);
  const jwt = await new SignJWT({ openId, appId, name })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(expSeconds)
    .sign(key);

  console.log(jwt);
}

main().catch((err) => {
  console.error('Erro ao gerar token:', err);
  process.exit(1);
});

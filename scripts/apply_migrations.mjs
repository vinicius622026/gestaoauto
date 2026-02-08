#!/usr/bin/env node
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { Client } from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SQL_FILE = resolve(__dirname, '..', 'drizzle', 'ALL_MIGRATIONS.sql')

function exitWith(msg, code = 1) {
  console.error(msg)
  process.exit(code)
}

if (!fs.existsSync(SQL_FILE)) {
  exitWith(`Arquivo de migrações não encontrado: ${SQL_FILE}`)
}

const rawUrl = process.env.DATABASE_URL

if (!rawUrl) {
  exitWith('ERRO: variável DATABASE_URL não definida. Exemplo:\nDATABASE_URL="postgres://user:pass@host:5432/dbname?sslmode=require"')
}

let connConfig
try {
  // Parse URL to safely decode percent-encoded parts
  const parsed = new URL(rawUrl)
  const user = parsed.username ? decodeURIComponent(parsed.username) : undefined
  const password = parsed.password ? decodeURIComponent(parsed.password) : undefined
  const host = parsed.hostname
  const port = parsed.port ? Number(parsed.port) : undefined
  const database = parsed.pathname ? parsed.pathname.replace(/^\//, '') : undefined
  const searchParams = parsed.searchParams
  const sslmode = searchParams.get('sslmode')

  connConfig = {
    host,
    port,
    user,
    password,
    database,
    ssl: sslmode === 'require' || sslmode === 'verify-full' ? { rejectUnauthorized: false } : undefined,
  }
} catch (err) {
  exitWith('ERRO: falha ao parsear DATABASE_URL: ' + String(err))
}

const sql = fs.readFileSync(SQL_FILE, 'utf8')

async function run() {
  const client = new Client(connConfig)
  try {
    console.log('Conectando ao banco...')
    await client.connect()
    console.log('Executando migrações... (pode demorar)')
    await client.query(sql)
    console.log('Migrações aplicadas com sucesso.')
  } catch (err) {
    console.error('Falha ao aplicar migrações:', err)
    process.exitCode = 2
  } finally {
    await client.end()
  }
}

run()

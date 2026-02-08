#!/usr/bin/env bash
set -euo pipefail

# Script para aplicar drizzle/ALL_MIGRATIONS.sql em um banco Postgres usando psql
# Uso:
#   DATABASE_URL="postgres://user:pass@host:5432/dbname?sslmode=require" ./scripts/apply_migrations.sh

SQL_FILE="drizzle/ALL_MIGRATIONS.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "Arquivo de migrações não encontrado: $SQL_FILE"
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERRO: variável DATABASE_URL não definida. Exemplo:" \
       "DATABASE_URL=\"postgres://user:pass@host:5432/dbname?sslmode=require\""
  exit 2
fi

echo "Aplicando migrações de $SQL_FILE para o banco apontado em DATABASE_URL..."

# Executa psql com a URL completa
psql "$DATABASE_URL" -f "$SQL_FILE"

echo "Migrações aplicadas com sucesso."

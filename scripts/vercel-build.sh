#!/bin/sh
# Vercel build entry point.
#
# Prisma reads POSTGRES_PRISMA_URL (pooled) and POSTGRES_URL_NON_POOLING
# (direct) — these are the two variables Vercel's Neon integration writes
# automatically. We give both placeholder values when they're missing so
# `prisma generate` can validate the schema even before the integration is
# attached, and only run `prisma db push` when both are real.
#
# 1. Give Prisma URLs to satisfy schema validation even before a Postgres
#    integration is attached (`prisma generate` does not open a connection
#    — the placeholder just satisfies the env() lookup).
# 2. Only run `prisma db push` when a REAL POSTGRES_URL_NON_POOLING is
#    present, so the first deploy on a fresh Vercel project doesn't crash
#    before the user has attached Postgres.
# 3. Always run `next build`.

set -e

PLACEHOLDER="postgresql://placeholder:placeholder@localhost:5432/placeholder"

if [ -z "${POSTGRES_PRISMA_URL}" ]; then
  export POSTGRES_PRISMA_URL="${PLACEHOLDER}"
  SKIP_DB_PUSH=1
  echo "vercel-build: POSTGRES_PRISMA_URL not set — using placeholder for schema generation only."
elif [ "${POSTGRES_PRISMA_URL}" = "${PLACEHOLDER}" ]; then
  SKIP_DB_PUSH=1
else
  SKIP_DB_PUSH=0
fi

if [ -z "${POSTGRES_URL_NON_POOLING}" ]; then
  export POSTGRES_URL_NON_POOLING="${PLACEHOLDER}"
  SKIP_DB_PUSH=1
fi

npx --no-install prisma generate

if [ "${SKIP_DB_PUSH}" = "0" ]; then
  echo "vercel-build: pushing Prisma schema to the direct Postgres URL."
  npx --no-install prisma db push --skip-generate --accept-data-loss
else
  echo "vercel-build: skipping prisma db push (no real POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING)."
  echo "vercel-build: attach Postgres in Vercel Storage → Neon integration, then redeploy."
fi

npx --no-install next build

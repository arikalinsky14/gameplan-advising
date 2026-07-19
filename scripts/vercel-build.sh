#!/bin/sh
# Vercel build entry point.
#
# 1. Give Prisma a URL to satisfy schema validation even before the Vercel
#    project has a real DATABASE_URL configured (`prisma generate` does not
#    open a connection — the placeholder is only there to make the env var
#    non-empty so schema validation passes).
# 2. Only run `prisma db push` when a REAL DATABASE_URL is present, so the
#    first deploy on a fresh Vercel project doesn't crash before the user has
#    attached Postgres.
# 3. Always run `next build`.

set -e

PLACEHOLDER="postgresql://placeholder:placeholder@localhost:5432/placeholder"

if [ -z "${DATABASE_URL}" ]; then
  export DATABASE_URL="${PLACEHOLDER}"
  echo "vercel-build: DATABASE_URL not set — using placeholder for schema generation only."
  SKIP_DB_PUSH=1
elif [ "${DATABASE_URL}" = "${PLACEHOLDER}" ]; then
  SKIP_DB_PUSH=1
else
  SKIP_DB_PUSH=0
fi

npx --no-install prisma generate

if [ "${SKIP_DB_PUSH}" = "0" ]; then
  echo "vercel-build: pushing Prisma schema to DATABASE_URL."
  npx --no-install prisma db push --skip-generate --accept-data-loss
else
  echo "vercel-build: skipping prisma db push (no real DATABASE_URL)."
  echo "vercel-build: attach Postgres in Vercel Storage or set DATABASE_URL + redeploy."
fi

npx --no-install next build

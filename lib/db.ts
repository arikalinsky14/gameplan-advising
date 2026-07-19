import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const PLACEHOLDER = "postgresql://placeholder:placeholder@localhost:5432/placeholder";

// True when Vercel (or local .env) has a real DATABASE_URL. Every code path
// that would otherwise call Prisma should short-circuit when this is false —
// deploying without a DB shouldn't crash the site, it should show a friendly
// "connect a database" state.
export function isDbConfigured(): boolean {
  const u = process.env.DATABASE_URL;
  return !!u && u !== PLACEHOLDER;
}

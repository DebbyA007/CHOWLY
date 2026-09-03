// One Prisma client per process. In development, Next.js reloads modules on every edit,
// and a fresh client each time would exhaust Neon's connection pool, so the instance is
// kept on globalThis outside production.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

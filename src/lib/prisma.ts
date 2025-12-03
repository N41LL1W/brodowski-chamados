import { PrismaClient } from "@prisma/client";

declare global {
  // Necessário para evitar recriar o Prisma em dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

// Evita múltiplas instâncias no ambiente de dev
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
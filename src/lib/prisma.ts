// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client'

// Cria uma variável global para armazenar a instância do PrismaClient
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// Inicializa o PrismaClient, usando a instância global se estiver disponível.
// Isso evita que o Next.js crie múltiplas instâncias em modo de desenvolvimento.
export const prisma = 
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error'],
  })

// Em ambiente de produção, não use o global
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        // Tenta ler a URL do pooler primeiro, depois a padrão
        url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
      },
    },
    log: ['warn', 'error'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
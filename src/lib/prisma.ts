import { PrismaClient } from '@prisma/client'

// Montamos a URL manualmente para evitar que o sistema se perca nos caracteres especiais
const dbUrl = "postgresql://neondb_owner:npg_LfwY48hnaVPs@ep-quiet-moon-ah4v70hu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
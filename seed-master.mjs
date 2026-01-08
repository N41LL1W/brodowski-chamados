import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Mude para bcryptjs

const prisma = new PrismaClient();

async function main() {
  const password = 'admin'; 
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
        passwordHash: hashedPassword // Garante que a senha será atualizada para o novo formato
    },
    create: {
      email: 'admin@admin.com',
      name: 'Administrador Master',
      passwordHash: hashedPassword,
      role: 'MASTER',
    },
  });

  console.log('✅ Usuário Master REFORMULADO com sucesso:', user.email);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
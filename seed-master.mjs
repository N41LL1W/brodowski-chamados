import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@admin.com';
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: email },
    update: {
      passwordHash: hashedPassword,
      role: 'MASTER'
    },
    create: {
      email: email,
      name: 'Administrador Master',
      passwordHash: hashedPassword,
      role: 'MASTER',
    },
  });

  console.log('✅ USUÁRIO MASTER PRONTO!');
  console.log('Email:', email);
  console.log('Senha: admin');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
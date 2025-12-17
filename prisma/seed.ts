// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  // Vamos usar a senha: admin123
  const senhaPlana = 'admin123'; 
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(senhaPlana, salt);

  await prisma.user.upsert({
    where: { email: 'master@gmail.com' },
    update: { 
        passwordHash: hash, 
        role: 'MASTER',
        name: 'Administrador Master' 
    },
    create: {
      email: 'master@gmail.com',
      name: 'Administrador Master',
      passwordHash: hash,
      role: 'MASTER',
    },
  });
  
  console.log('-----------------------------------------');
  console.log('✅ USUÁRIO MASTER SINCRONIZADO');
  console.log('📧 Email: master@gmail.com');
  console.log('🔑 Senha: admin123');
  console.log('-----------------------------------------');
}

main().then(() => prisma.$disconnect());
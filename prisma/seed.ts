import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const locations = [
    { name: 'Sala de aula', type: 'classroom' },
    { name: 'Área externa', type: 'external' },
    { name: 'Administrativo', type: 'administrative' },
    { name: 'Banheiro', type: 'restroom' },
    { name: 'Laboratório', type: 'lab' },
  ];

  const locationCount = await prisma.location.count();
  if (locationCount === 0) {
    await prisma.location.createMany({ data: locations });
    console.log('Locais criados.');
  } else {
    console.log('Locais já existem, pulando criação.');
  }

  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@empresa.com',
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'gestor@empresa.com' },
    update: {},
    create: {
      name: 'Gestor',
      email: 'gestor@empresa.com',
      role: 'MANAGER',
    },
  });

  console.log('Usuários de teste prontos:', { admin: admin.email, manager: manager.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

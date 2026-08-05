import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const locations = [
    { name: 'Campus Principal', type: 'campus' },
    { name: 'Bloco A', type: 'building' },
    { name: 'Sala 101', type: 'room' },
    { name: 'Sala 102', type: 'room' },
    { name: 'Corredor', type: 'corridor' },
    { name: 'Bloco B', type: 'building' },
    { name: 'Laboratório 1', type: 'lab' },
    { name: 'Laboratório 2', type: 'lab' },
    { name: 'Área Externa', type: 'external' },
  ];

  const locationCount = await prisma.location.count();
  if (locationCount === 0) {
    const campus = await prisma.location.create({ data: locations[0] });
    const blocoA = await prisma.location.create({ data: { ...locations[1], parentId: campus.id } });
    await prisma.location.create({ data: { ...locations[2], parentId: blocoA.id } });
    await prisma.location.create({ data: { ...locations[3], parentId: blocoA.id } });
    await prisma.location.create({ data: { ...locations[4], parentId: blocoA.id } });
    const blocoB = await prisma.location.create({ data: { ...locations[5], parentId: campus.id } });
    await prisma.location.create({ data: { ...locations[6], parentId: blocoB.id } });
    await prisma.location.create({ data: { ...locations[7], parentId: blocoB.id } });
    await prisma.location.create({ data: { ...locations[8], parentId: campus.id } });
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

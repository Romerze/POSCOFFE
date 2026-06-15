import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { ALL_ROLES, DEFAULT_ROLE_PERMISSIONS, ROLES, type Role } from '@poscoffe/types';

const prisma = new PrismaClient();

async function main() {
  // 1. Roles base con sus permisos por defecto.
  for (const nombre of ALL_ROLES) {
    await prisma.rol.upsert({
      where: { nombre },
      update: { permisos: DEFAULT_ROLE_PERMISSIONS[nombre as Role] },
      create: { nombre, permisos: DEFAULT_ROLE_PERMISSIONS[nombre as Role] },
    });
  }

  // 2. Local de demostración.
  const local = await prisma.local.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nombre: 'POSCOFFE Demo',
      direccion: 'Av. Café 123',
      timezone: 'America/Lima',
      moneda: 'PEN',
    },
  });

  // 3. Usuarios de ejemplo (password: poscoffe123 · pin: 1234).
  const passwordHash = await argon2.hash('poscoffe123');
  const pinHash = await argon2.hash('1234');

  const rolOwner = await prisma.rol.findUniqueOrThrow({ where: { nombre: ROLES.OWNER } });
  const rolCashier = await prisma.rol.findUniqueOrThrow({ where: { nombre: ROLES.CASHIER } });
  const rolBarista = await prisma.rol.findUniqueOrThrow({ where: { nombre: ROLES.BARISTA } });

  await prisma.usuario.upsert({
    where: { email: 'dueno@poscoffe.dev' },
    update: {},
    create: {
      nombre: 'Dueño Demo',
      email: 'dueno@poscoffe.dev',
      passwordHash,
      pinHash,
      rolId: rolOwner.id,
      localId: null, // multi-local
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'cajero@poscoffe.dev' },
    update: {},
    create: {
      nombre: 'Cajero Demo',
      email: 'cajero@poscoffe.dev',
      passwordHash,
      pinHash,
      rolId: rolCashier.id,
      localId: local.id,
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'barista@poscoffe.dev' },
    update: {},
    create: {
      nombre: 'Barista Demo',
      email: 'barista@poscoffe.dev',
      passwordHash,
      pinHash,
      rolId: rolBarista.id,
      localId: local.id,
    },
  });

  // eslint-disable-next-line no-console
  console.log('✅ Seed completado. Login demo: dueno@poscoffe.dev / poscoffe123');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

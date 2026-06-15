import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { ALL_ROLES, DEFAULT_ROLE_PERMISSIONS, ROLES, type Role } from '@poscoffe/types';

const prisma = new PrismaClient();

/** UUID v4 determinista a partir de un sufijo hex (≤12 chars). */
function uid(suffix: string): string {
  return `00000000-0000-4000-8000-${suffix.padStart(12, '0')}`;
}

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
  const localId = uid('1');
  const local = await prisma.local.upsert({
    where: { id: localId },
    update: {},
    create: {
      id: localId,
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
    create: { nombre: 'Dueño Demo', email: 'dueno@poscoffe.dev', passwordHash, pinHash, rolId: rolOwner.id, localId: null },
  });
  await prisma.usuario.upsert({
    where: { email: 'cajero@poscoffe.dev' },
    update: {},
    create: { nombre: 'Cajero Demo', email: 'cajero@poscoffe.dev', passwordHash, pinHash, rolId: rolCashier.id, localId: local.id },
  });
  await prisma.usuario.upsert({
    where: { email: 'barista@poscoffe.dev' },
    update: {},
    create: { nombre: 'Barista Demo', email: 'barista@poscoffe.dev', passwordHash, pinHash, rolId: rolBarista.id, localId: local.id },
  });

  // 4. Caja del local.
  await prisma.caja.upsert({
    where: { id: uid('c1') },
    update: {},
    create: { id: uid('c1'), localId: local.id, nombre: 'Caja 1' },
  });

  // 5. Insumos + stock inicial en el local.
  const insumos: Record<string, string> = {};
  const insumoDefs = [
    { key: 'cafe', id: '101', nombre: 'Café molido', unidad: 'g', costoUnitario: 0.05 },
    { key: 'leche', id: '102', nombre: 'Leche', unidad: 'ml', costoUnitario: 0.004 },
    { key: 'avena', id: '103', nombre: 'Leche de avena', unidad: 'ml', costoUnitario: 0.01 },
    { key: 'vaso', id: '104', nombre: 'Vaso 12oz', unidad: 'u', costoUnitario: 0.3 },
  ];
  for (const d of insumoDefs) {
    const id = uid(d.id);
    const insumo = await prisma.insumo.upsert({
      where: { id },
      update: { costoUnitario: d.costoUnitario },
      create: { id, nombre: d.nombre, unidad: d.unidad, costoUnitario: d.costoUnitario },
    });
    insumos[d.key] = insumo.id;
    await prisma.inventario.upsert({
      where: { localId_insumoId: { localId: local.id, insumoId: insumo.id } },
      update: {},
      create: { localId: local.id, insumoId: insumo.id, stockActual: 10000, stockMinimo: 500, puntoReorden: 1000 },
    });
  }

  // 6. Categoría + productos + variantes + recetas (con costeo).
  const categoria = await prisma.categoria.upsert({
    where: { id: uid('a01') },
    update: {},
    create: { id: uid('a01'), localId: local.id, nombre: 'Café caliente', orden: 1 },
  });

  const productosDef = [
    {
      id: 'b01',
      nombre: 'Latte',
      variantes: [
        { id: 'd01', nombre: 'Mediano', precio: 12, receta: [['cafe', 18], ['leche', 200], ['vaso', 1]] },
        { id: 'd02', nombre: 'Grande', precio: 15, receta: [['cafe', 24], ['leche', 300], ['vaso', 1]] },
      ],
    },
    { id: 'b02', nombre: 'Espresso', variantes: [{ id: 'd03', nombre: 'Único', precio: 8, receta: [['cafe', 18]] }] },
    {
      id: 'b03',
      nombre: 'Capuccino',
      variantes: [{ id: 'd04', nombre: 'Mediano', precio: 13, receta: [['cafe', 18], ['leche', 150], ['vaso', 1]] }],
    },
  ];

  for (const p of productosDef) {
    const pid = uid(p.id);
    await prisma.producto.upsert({
      where: { id: pid },
      update: {},
      create: { id: pid, localId: local.id, categoriaId: categoria.id, nombre: p.nombre },
    });
    for (const v of p.variantes) {
      const vid = uid(v.id);
      await prisma.variante.upsert({
        where: { id: vid },
        update: { precio: v.precio },
        create: { id: vid, productoId: pid, nombre: v.nombre, precio: v.precio },
      });
      await prisma.receta.deleteMany({ where: { varianteId: vid } });
      let costo = 0;
      for (const [key, cantidad] of v.receta as [string, number][]) {
        await prisma.receta.create({ data: { varianteId: vid, insumoId: insumos[key], cantidad } });
        costo += insumoDefs.find((d) => d.key === key)!.costoUnitario * cantidad;
      }
      await prisma.variante.update({ where: { id: vid }, data: { costoCalculado: costo } });
    }
  }

  // 7. Grupo de modificadores "Tipo de leche" enlazado a Latte y Capuccino.
  const grupoId = uid('e01');
  const grupo = await prisma.modificadorGrupo.upsert({
    where: { id: grupoId },
    update: {},
    create: { id: grupoId, nombre: 'Tipo de leche', seleccion: 'unica', obligatorio: false },
  });
  await prisma.modificador.upsert({
    where: { id: uid('f01') },
    update: {},
    create: { id: uid('f01'), grupoId: grupo.id, nombre: 'Entera', precioExtra: 0 },
  });
  await prisma.modificador.upsert({
    where: { id: uid('f02') },
    update: {},
    create: { id: uid('f02'), grupoId: grupo.id, nombre: 'Avena', precioExtra: 1.5, insumoId: insumos['avena'], cantidadInsumo: 200 },
  });
  for (const short of ['b01', 'b03']) {
    const productoId = uid(short);
    await prisma.productoModificadorGrupo.upsert({
      where: { productoId_grupoId: { productoId, grupoId: grupo.id } },
      update: {},
      create: { productoId, grupoId: grupo.id },
    });
  }

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

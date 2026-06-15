import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AbrirTurnoDto, CerrarCajaDto, CreateCajaDto, RetiroDto } from './dto/cash.dto';

const D = (v: Prisma.Decimal.Value) => new Prisma.Decimal(v);

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  listCajas(localId: string) {
    return this.prisma.caja.findMany({ where: { localId }, orderBy: { nombre: 'asc' } });
  }

  createCaja(dto: CreateCajaDto) {
    return this.prisma.caja.create({ data: dto });
  }

  turnoAbierto(localId: string) {
    return this.prisma.turno.findFirst({ where: { localId, estado: 'abierto' } });
  }

  /** Abre un turno y registra el fondo de caja como movimiento de apertura. */
  async abrirTurno(dto: AbrirTurnoDto, usuarioId: string) {
    const yaAbierto = await this.prisma.turno.findFirst({
      where: { localId: dto.localId, estado: 'abierto' },
    });
    if (yaAbierto) throw new BadRequestException('Ya hay un turno abierto en este local');

    return this.prisma.$transaction(async (tx) => {
      const turno = await tx.turno.create({
        data: { localId: dto.localId, usuarioId, estado: 'abierto' },
      });
      await tx.caja.update({ where: { id: dto.cajaId }, data: { estado: 'abierta' } });
      await tx.movimientoCaja.create({
        data: { cajaId: dto.cajaId, turnoId: turno.id, tipo: 'apertura', monto: dto.montoInicial },
      });
      return turno;
    });
  }

  registrarRetiro(dto: RetiroDto) {
    return this.prisma.movimientoCaja.create({
      data: { cajaId: dto.cajaId, turnoId: dto.turnoId, tipo: 'retiro', monto: D(dto.monto).negated() },
    });
  }

  /**
   * Cierra la caja: cuadra el efectivo esperado contra el contado y emite el
   * reporte Z. Ver docs/08 §8.10. No se puede cerrar con pedidos sin pagar.
   */
  async cerrarCaja(dto: CerrarCajaDto) {
    const turno = await this.prisma.turno.findUnique({ where: { id: dto.turnoId } });
    if (!turno) throw new NotFoundException('Turno no encontrado');
    if (turno.estado !== 'abierto') throw new BadRequestException('El turno no está abierto');

    const desde = turno.apertura;
    const hasta = new Date();

    // Pagos atribuidos a este turno, por método (vínculo directo turnoId).
    const pagos = await this.prisma.pago.findMany({
      where: { estado: 'aprobado', turnoId: turno.id },
      include: { pedido: { select: { id: true, total: true } } },
    });

    const ventasPorMetodo: Record<string, Prisma.Decimal> = {};
    let propinas = D(0);
    for (const p of pagos) {
      ventasPorMetodo[p.metodo] = (ventasPorMetodo[p.metodo] ?? D(0)).add(p.monto);
      propinas = propinas.add(p.propina);
    }

    // Pedidos sin pagar (total > pagado) en el periodo → bloquean el cierre.
    const pedidos = await this.prisma.pedido.findMany({
      where: { localId: turno.localId, estado: { not: 'cancelado' }, creadoEn: { gte: desde, lte: hasta } },
      include: { pagos: true },
    });
    const sinPagar = pedidos.filter((ped) => {
      const pagado = ped.pagos.reduce((acc, pg) => acc.add(pg.monto), D(0));
      return pagado.lt(ped.total);
    });
    if (sinPagar.length > 0) {
      throw new BadRequestException(`Hay ${sinPagar.length} pedido(s) sin pagar; resuélvelos antes de cerrar`);
    }

    // Movimientos de caja del turno (apertura, retiros).
    const movimientos = await this.prisma.movimientoCaja.findMany({ where: { turnoId: turno.id } });
    const montoInicial = movimientos
      .filter((m) => m.tipo === 'apertura')
      .reduce((acc, m) => acc.add(m.monto), D(0));
    const retiros = movimientos
      .filter((m) => m.tipo === 'retiro')
      .reduce((acc, m) => acc.add(m.monto), D(0)); // ya negativos

    const ventasEfectivo = ventasPorMetodo['efectivo'] ?? D(0);
    const efectivoEsperado = montoInicial.add(ventasEfectivo).add(retiros);
    const diferencia = D(dto.efectivoContado).sub(efectivoEsperado);

    const reporteZ = await this.prisma.$transaction(async (tx) => {
      await tx.movimientoCaja.create({
        data: { cajaId: dto.cajaId, turnoId: turno.id, tipo: 'cierre', monto: dto.efectivoContado },
      });
      await tx.caja.update({ where: { id: dto.cajaId }, data: { estado: 'cerrada' } });
      await tx.turno.update({ where: { id: turno.id }, data: { estado: 'cerrado', cierre: hasta } });

      return {
        turnoId: turno.id,
        localId: turno.localId,
        desde,
        hasta,
        montoInicial,
        ventasPorMetodo,
        propinas,
        retiros,
        efectivoEsperado,
        efectivoContado: D(dto.efectivoContado),
        diferencia,
        totalPedidos: pedidos.length,
      };
    });

    return reporteZ;
  }
}

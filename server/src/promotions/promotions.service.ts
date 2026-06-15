import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromocionDto, UpdatePromocionDto } from './dto/promotion.dto';
import {
  evaluatePromotions,
  type CartLine,
  type PromoCondicion,
  type PromoEfecto,
  type PromoEvaluable,
  type PromoResult,
} from './promotion-engine';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  list(localId?: string) {
    return this.prisma.promocion.findMany({
      where: localId ? { OR: [{ localId }, { localId: null }] } : {},
      include: { reglas: true },
      orderBy: { prioridad: 'desc' },
    });
  }

  /** Crea una promoción con una regla (condición + efecto). */
  create(dto: CreatePromocionDto) {
    return this.prisma.promocion.create({
      data: {
        localId: dto.localId ?? null,
        nombre: dto.nombre,
        tipo: dto.tipo,
        vigenciaDesde: new Date(dto.vigenciaDesde),
        vigenciaHasta: new Date(dto.vigenciaHasta),
        prioridad: dto.prioridad ?? 0,
        reglas: { create: [{ condicion: dto.condicion as object, efecto: dto.efecto as object }] },
      },
      include: { reglas: true },
    });
  }

  update(id: string, dto: UpdatePromocionDto) {
    return this.prisma.promocion.update({ where: { id }, data: dto });
  }

  /** Carga las promos vigentes y activas del local (o globales) como evaluables. */
  private async loadEvaluables(localId: string, now: Date): Promise<PromoEvaluable[]> {
    const promos = await this.prisma.promocion.findMany({
      where: {
        activa: true,
        vigenciaDesde: { lte: now },
        vigenciaHasta: { gte: now },
        OR: [{ localId }, { localId: null }],
      },
      include: { reglas: true },
    });

    return promos
      .filter((p) => p.reglas.length > 0)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        tipo: p.tipo,
        prioridad: p.prioridad,
        condicion: (p.reglas[0].condicion as unknown as PromoCondicion) ?? {},
        efecto: (p.reglas[0].efecto as unknown as PromoEfecto) ?? { tipo: 'monto', valor: 0 },
      }));
  }

  /** Evalúa el carrito contra las promos vigentes del local. */
  async evaluateForCart(localId: string, lines: CartLine[], now: Date = new Date()): Promise<PromoResult> {
    const evaluables = await this.loadEvaluables(localId, now);
    return evaluatePromotions(lines, evaluables, now);
  }
}

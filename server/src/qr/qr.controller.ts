import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CatalogService } from '../catalog/catalog.service';
import { OrdersService } from '../sales/orders.service';
import { QrOrderDto } from './dto/qr-order.dto';

/**
 * Superficie pública para clientes: menú por QR y creación de pedidos
 * de mesa (QR) o pick-up, sin autenticación de staff. Ver docs/04 flujos 3 y 4.
 */
@Controller('qr')
export class QrController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly orders: OrdersService,
  ) {}

  @Public()
  @Get(':localId/menu')
  async menu(@Param('localId') localId: string) {
    const [categorias, productos] = await Promise.all([
      this.catalog.listCategorias(localId),
      this.catalog.listProductos(localId),
    ]);
    return { localId, categorias, productos };
  }

  @Public()
  @Get(':localId/producto/:id')
  producto(@Param('id') id: string) {
    return this.catalog.getProducto(id);
  }

  @Public()
  @Post(':localId/pedido')
  crearPedido(@Param('localId') localId: string, @Body() dto: QrOrderDto) {
    // Pedido sin operador (usuarioId null); entra al KDS como cualquier otro.
    return this.orders.createOrder(
      {
        operationId: dto.operationId,
        localId,
        clienteId: dto.clienteId,
        canal: dto.canal,
        mesa: dto.mesa,
        items: dto.items,
      },
      null,
    );
  }
}

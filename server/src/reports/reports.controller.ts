import { Controller, Get, Query } from '@nestjs/common';
import { PERMISSIONS } from '@poscoffe/types';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { ReportsService } from './reports.service';

@Controller()
@RequirePermissions(PERMISSIONS.REPORTS_VIEW)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard/kpis')
  dashboard(@Query('local') localId: string) {
    return this.reports.dashboard(localId);
  }

  @Get('reportes/mapa-calor')
  mapaCalor(@Query('local') localId: string, @Query('dias') dias?: string) {
    return this.reports.mapaCalor(localId, dias ? Number(dias) : undefined);
  }

  @Get('reportes/quiebres')
  quiebres(@Query('local') localId: string, @Query('dias') dias?: string) {
    return this.reports.prediccionQuiebres(localId, dias ? Number(dias) : undefined);
  }

  @Get('reportes/ranking')
  ranking(@Query('local') localId: string, @Query('dias') dias?: string) {
    return this.reports.rankingPersonal(localId, dias ? Number(dias) : undefined);
  }

  @Get('reportes/margenes')
  margenes(@Query('local') localId: string) {
    return this.reports.margenes(localId);
  }
}

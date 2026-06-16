import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PERMISSIONS } from '@poscoffe/types';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { CreateEncuestaDto } from './dto/survey.dto';
import { SurveysService } from './surveys.service';

@Controller()
export class SurveysController {
  constructor(private readonly surveys: SurveysService) {}

  /** Respuesta pública desde el QR del ticket (sin login). */
  @Public()
  @Post('encuestas')
  responder(@Body() dto: CreateEncuestaDto) {
    return this.surveys.responder(dto);
  }

  /** Panel de experiencia (dueño/admin). */
  @Get('reportes/experiencia')
  @RequirePermissions(PERMISSIONS.REPORTS_VIEW)
  panel(@Query('local') localId: string, @Query('dias') dias?: string) {
    return this.surveys.panel(localId, dias ? Number(dias) : undefined);
  }
}

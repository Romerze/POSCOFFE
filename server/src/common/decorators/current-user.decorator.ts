import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@poscoffe/types';

/** Inyecta el usuario autenticado (payload del JWT) en el handler. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);

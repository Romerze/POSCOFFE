import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import type { JwtPayload, LoginResponse } from '@poscoffe/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto, PinLoginDto, RefreshDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.auth.login(dto.email, dto.password);
  }

  @Public()
  @Post('pin')
  @HttpCode(200)
  pinLogin(@Body() dto: PinLoginDto): Promise<LoginResponse> {
    return this.auth.pinLogin(dto.userId, dto.pin);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto): Promise<LoginResponse> {
    return this.auth.refresh(dto.refreshToken);
  }

  @Get('me')
  me(@CurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  DEFAULT_ROLE_PERMISSIONS,
  type AuthUser,
  type JwtPayload,
  type LoginResponse,
  type Permission,
  type Role,
} from '@poscoffe/types';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });
    if (!usuario || !usuario.activo) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await argon2.verify(usuario.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return this.buildSession(usuario);
  }

  async pinLogin(userId: string, pin: string): Promise<LoginResponse> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { rol: true },
    });
    if (!usuario || !usuario.activo || !usuario.pinHash) {
      throw new UnauthorizedException('PIN inválido');
    }
    const ok = await argon2.verify(usuario.pinHash, pin);
    if (!ok) throw new UnauthorizedException('PIN inválido');

    return this.buildSession(usuario);
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { rol: true },
    });
    if (!usuario || !usuario.activo) throw new UnauthorizedException('Usuario no válido');
    return this.buildSession(usuario);
  }

  private resolvePermissions(rolNombre: string, rawPermisos: unknown): Permission[] {
    if (Array.isArray(rawPermisos) && rawPermisos.length > 0) {
      return rawPermisos as Permission[];
    }
    return DEFAULT_ROLE_PERMISSIONS[rolNombre as Role] ?? [];
  }

  private async buildSession(usuario: {
    id: string;
    nombre: string;
    email: string;
    localId: string | null;
    rol: { nombre: string; permisos: unknown };
  }): Promise<LoginResponse> {
    const role = usuario.rol.nombre as Role;
    const permissions = this.resolvePermissions(usuario.rol.nombre, usuario.rol.permisos);

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      role,
      localId: usuario.localId,
      permissions,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret'),
      expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m'),
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
      expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '7d'),
    });

    const user: AuthUser = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      role,
      localId: usuario.localId,
      permissions,
    };

    return { accessToken, refreshToken, user };
  }
}

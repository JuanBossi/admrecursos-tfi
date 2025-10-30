import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Tecnico } from '../../../personas/tecnico/entities/tecnico.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Tecnico) private readonly tecnicoRepo: Repository<Tecnico>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req: Request & { user?: any } = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || '';
    const [scheme, token] = (auth as string).split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('No autorizado');

    let payload: any;
    try {
      const json = Buffer.from(token, 'base64').toString('utf8');
      payload = JSON.parse(json);
    } catch (_) {
      throw new UnauthorizedException('Token inválido');
    }

    if (!payload?.id) throw new UnauthorizedException('Token inválido');

    const user = await this.usuarioRepo.findOne({
      where: { id: String(payload.id) },
      relations: { roles: true, empleado: true },
    });
    if (!user || !user.activo) throw new UnauthorizedException('Usuario no válido');

    // Enriquecer con técnico si corresponde
    const roleNames = (user.roles || []).map((r) => r.nombre);
    let tecnico: Tecnico | undefined;
    if (roleNames.includes('Tecnico')) {
      const empleadoId = (user as any).empleado?.id || (user as any).empleadoId;
      if (empleadoId) {
        const found = await this.tecnicoRepo.findOne({ where: { id: String(empleadoId) } });
        tecnico = found || undefined;
      } else {
        const email = (user as any).email || (user as any).username;
        if (email) {
          const foundByEmail = await this.tecnicoRepo.findOne({ where: { contacto: String(email) } });
          tecnico = foundByEmail || undefined;
        }
      }
    }

    (req as any).user = tecnico ? { ...user, tecnico } : user;
    return true;
  }
}

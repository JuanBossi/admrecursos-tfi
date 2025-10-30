import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async login(usernameOrEmail: string, password: string) {
    const user = await this.usuarioRepo.findOne({
      where: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ] as any,
      relations: { roles: true, empleado: true },
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    if (!user.activo) throw new UnauthorizedException('Usuario inactivo');
    if (!user.passwordHash) throw new UnauthorizedException('Usuario sin password configurado');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    // Token simple de muestra (puedes cambiar a JWT si lo deseas)
    const tokenPayload = { id: user.id, username: user.username, ts: Date.now() };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    // No devolver passwordHash
    const { passwordHash, ...safeUser } = user as any;
    return { user: safeUser, token };
  }
}



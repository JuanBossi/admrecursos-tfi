import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Tecnico } from '../../personas/tecnico/entities/tecnico.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Tecnico) private readonly tecnicoRepo: Repository<Tecnico>,
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

    const tokenPayload = { id: user.id, username: user.username, ts: Date.now() };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    const names = (user.roles || []).map((r) => r.nombre);
    let tecnico: Tecnico | undefined;
    if (names.includes('Tecnico')) {
      const id = (user as any).empleado?.id || (user as any).empleadoId;
      if (id) {
        const found = await this.tecnicoRepo.findOne({ where: { id: String(id) } });
        tecnico = found || undefined;
      } else {
        const email = (user as any).email || (user as any).username;
        if (email) {
          const foundByEmail = await this.tecnicoRepo.findOne({ where: { contacto: String(email) } });
          tecnico = foundByEmail || undefined;
        }
      }
    }

    const { passwordHash, ...safeUser } = user as any;
    return { user: { ...safeUser, ...(tecnico ? { tecnico } : {}) }, token };
  }
}



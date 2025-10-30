import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Rol } from '../rol/entities/rol.entity';
import { IsNotEmpty, IsString } from 'class-validator';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string; // puede ser username o email

  @IsString()
  @IsNotEmpty()
  password!: string;
}

import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
  ) {}

  @Public()
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.service.login(body.username, body.password);
  }

  // Endpoint de ayuda (solo dev/local) para crear seed admin rápido

  @Public()
  @Post('dev/seed-admin')
  async seedAdmin() {
    let rolAdmin = await this.rolRepo.findOne({ where: { nombre: 'Administrador' } });
    if (!rolAdmin) {
      rolAdmin = await this.rolRepo.save(this.rolRepo.create({ nombre: 'Administrador', descripcion: 'Acceso total' }));
    }

    let admin = await this.usuarioRepo.findOne({ where: { username: 'admin' }, relations: { roles: true } });
    if (!admin) {
      const passwordHash = await bcrypt.hash('admin', 10);
      admin = this.usuarioRepo.create({ username: 'admin', email: 'admin@example.com', passwordHash, activo: 1, roles: [rolAdmin] });
      await this.usuarioRepo.save(admin);
    } else {
      // asegura rol y password
      if (!admin.roles?.some(r => r.nombre === 'Administrador')) {
        admin.roles = [...(admin.roles || []), rolAdmin];
      }
      if (!admin.passwordHash) {
        admin.passwordHash = await bcrypt.hash('admin', 10);
      }
      await this.usuarioRepo.save(admin);
    }
    const { passwordHash, ...safe } = admin as any;
    return { ok: true, admin: safe };
  }
}



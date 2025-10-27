import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { QueryUsuarioDto } from './dto/query-usuario.dto';
import { Rol } from '../rol/entities/rol.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario) private repo: Repository<Usuario>,
    @InjectRepository(Rol) private rolRepo: Repository<Rol>,
  ) {}

  private async ensureUnique(username: string, email: string, ignoreId?: string) {
    const existsUser = await this.repo.findOne({ where: { username } });
    if (existsUser && existsUser.id !== ignoreId) throw new BadRequestException('El username ya existe');

    const existsEmail = await this.repo.findOne({ where: { email } });
    if (existsEmail && existsEmail.id !== ignoreId) throw new BadRequestException('El email ya existe');
  }

  async create(dto: CreateUsuarioDto) {
    await this.ensureUnique(dto.username, dto.email);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const roles: Rol[] = [];
    if (dto.rolesIds?.length) {
      const found = await this.rolRepo.findByIds(dto.rolesIds as any);
      if (found.length !== dto.rolesIds.length) {
        throw new BadRequestException('Alguno de los roles no existe');
      }
      roles.push(...found);
    }

    const usuario = this.repo.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      activo: dto.activo ?? 1,
      empleado: dto.empleadoId ? ({ id: dto.empleadoId } as any) : undefined,
      roles,
    });

    return this.repo.save(usuario);
  }

  async findAll(q: QueryUsuarioDto) {
    const { page = 1, limit = 10, search, empleadoId, activo } = q;

    const where: any = {};
    if (search) where.username = ILike(`%${search}%`);
    if (empleadoId) where.empleado = { id: empleadoId };
    if (activo !== undefined) where.activo = Number(activo);

    // búsqueda también por email si viene search
    const whereArray = search
      ? [ where, { email: ILike(`%${search}%`), ...(empleadoId ? { empleado: { id: empleadoId } } : {}), ...(activo !== undefined ? { activo: Number(activo) } : {}) } ]
      : where;

    const [items, total] = await this.repo.findAndCount({
      where: whereArray as any,
      relations: { empleado: true, roles: true },
      take: limit,
      skip: (page - 1) * limit,
      order: { username: 'ASC' },
    });

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id }, relations: { empleado: true, roles: true } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const user = await this.findOne(id);

    if (dto.username && dto.username !== user.username) {
      await this.ensureUnique(dto.username, user.email, id);
      user.username = dto.username;
    }

    if (dto.email && dto.email !== user.email) {
      await this.ensureUnique(user.username, dto.email, id);
      user.email = dto.email;
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    if (dto.empleadoId !== undefined) {
      (user as any).empleado = dto.empleadoId ? ({ id: dto.empleadoId } as any) : null;
    }

    if (dto.activo !== undefined) user.activo = Number(dto.activo);

    // reemplazar roles si vino rolesIds
    if (dto.rolesIds) {
      const found = await this.rolRepo.findByIds(dto.rolesIds as any);
      if (found.length !== dto.rolesIds.length) {
        throw new BadRequestException('Alguno de los roles no existe');
      }
      user.roles = found;
    }

    return this.repo.save(user);
  }

  async setActivo(id: string, activo: boolean) {
    const user = await this.findOne(id);
    user.activo = activo ? 1 : 0;
    return this.repo.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.repo.remove(user);
    return { deleted: true };
  }
}

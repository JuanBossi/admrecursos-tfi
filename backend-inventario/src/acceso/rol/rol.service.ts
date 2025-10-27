import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';

@Injectable()
export class RolService {
  constructor(@InjectRepository(Rol) private repo: Repository<Rol>) {}

  async create(nombre: string, descripcion?: string) {
    const dup = await this.repo.exists({ where: { nombre: ILike(nombre) } });
    if (dup) throw new BadRequestException('El rol ya existe');
    return this.repo.save(this.repo.create({ nombre, descripcion }));
  }

  async findAll(search?: string) {
    const where = search ? { nombre: ILike(`%${search}%`) } : {};
    return this.repo.find({ where, order: { nombre: 'ASC' } });
  }

  async findOne(id: string) {
    const rol = await this.repo.findOne({ where: { id } });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return rol;
  }

  async update(id: string, nombre?: string, descripcion?: string) {
    const rol = await this.findOne(id);
    if (nombre && nombre !== rol.nombre) {
      const dup = await this.repo.exists({ where: { nombre: ILike(nombre) } });
      if (dup) throw new BadRequestException('Ya existe otro rol con ese nombre');
      rol.nombre = nombre;
    }
    if (descripcion !== undefined) rol.descripcion = descripcion;
    return this.repo.save(rol);
  }

  async remove(id: string) {
    const rol = await this.findOne(id);
    await this.repo.remove(rol);
    return { deleted: true };
  }
}

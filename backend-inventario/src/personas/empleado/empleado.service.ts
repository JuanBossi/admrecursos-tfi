import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { QueryEmpleadoDto } from './dto/query-empleado.dto';

const normalizeDni = (dni: string) => dni.replace(/\D/g, '');

@Injectable()
export class EmpleadoService {
  constructor(@InjectRepository(Empleado) private repo: Repository<Empleado>) {}

  async create(dto: CreateEmpleadoDto) {
    const dni = normalizeDni(dto.dni);
    const exists = await this.repo.exists({ where: { dni } });
    if (exists) throw new BadRequestException('El DNI ya está registrado');

    const empleado = this.repo.create({
      nombre: dto.nombre,
      apellido: dto.apellido,
      dni,
      contacto: dto.contacto,
      area: dto.areaId ? ({ id: dto.areaId } as any) : undefined,
    });

    return this.repo.save(empleado);
  }

  async findAll(q: QueryEmpleadoDto) {
    const { page = 1, limit = 10, search, areaId } = q;

    const where: any[] | any = search
      ? [
          { nombre: ILike(`%${search}%`) },
          { apellido: ILike(`%${search}%`) },
          { dni: ILike(`%${search.replace(/\D/g, '')}%`) },
        ]
      : {};

    if (Array.isArray(where)) {
      // al usar array (OR), aplicamos areaId en cada rama
      const filtered = where.map(w => (areaId ? { ...w, area: { id: areaId } } : w));
      const [items, total] = await this.repo.findAndCount({
        where: filtered,
        relations: { area: true },
        take: limit,
        skip: (page - 1) * limit,
        order: { apellido: 'ASC', nombre: 'ASC' },
      });
      return { items, total, page, limit };
    } else {
      if (areaId) where.area = { id: areaId };
      const [items, total] = await this.repo.findAndCount({
        where,
        relations: { area: true },
        take: limit,
        skip: (page - 1) * limit,
        order: { apellido: 'ASC', nombre: 'ASC' },
      });
      return { items, total, page, limit };
    }
  }

  async findOne(id: string) {
    const emp = await this.repo.findOne({ where: { id }, relations: { area: true } });
    if (!emp) throw new NotFoundException('Empleado no encontrado');
    return emp;
  }

  async update(id: string, dto: UpdateEmpleadoDto) {
    const emp = await this.findOne(id);

    if (dto.dni !== undefined) {
      const dni = normalizeDni(dto.dni);
      if (dni !== emp.dni) {
        const dup = await this.repo.exists({ where: { dni } });
        if (dup) throw new BadRequestException('El DNI ya está registrado por otro empleado');
      }
      emp.dni = dni;
    }

    if (dto.nombre !== undefined) emp.nombre = dto.nombre;
    if (dto.apellido !== undefined) emp.apellido = dto.apellido;
    if (dto.contacto !== undefined) emp.contacto = dto.contacto;

    if (dto.areaId !== undefined) {
      (emp as any).area = dto.areaId ? ({ id: dto.areaId } as any) : null;
    }

    return this.repo.save(emp);
  }

  async remove(id: string) {
    const emp = await this.findOne(id);
    await this.repo.remove(emp);
    return { deleted: true };
  }
}

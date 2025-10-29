import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Periferico, PerifericoEstado } from './entities/periferico.entity';
import { CreatePerifericoDto } from './dto/create-periferico.dto';
import { UpdatePerifericoDto } from './dto/update-periferico.dto';
import { QueryPerifericoDto } from './dto/query-periferico.dto';


@Injectable()
export class PerifericoService {
  constructor(@InjectRepository(Periferico) private repo: Repository<Periferico>) {}

  async create(dto: CreatePerifericoDto) {

    const p = this.repo.create({
      tipo: { id: dto.tipoId } as any,
      equipo: dto.equipoId ? ({ id: dto.equipoId } as any) : undefined,
      marca: dto.marcaId ? ({ id: dto.marcaId } as any) : undefined,
      modelo: dto.modelo,
      estado: dto.estado ?? PerifericoEstado.ACTIVO,
      especificaciones: dto.especificaciones,
    });
    return this.repo.save(p);
  }

  async findAll(q: QueryPerifericoDto) {
    const { page = 1, limit = 10, search, equipoId, tipoId, marcaId, estado } = q;

    const where: any = {};
    if (search) where.modelo = ILike(`%${search}%`);
    if (equipoId) where.equipo = { id: equipoId };
    if (tipoId) where.tipo = { id: tipoId };
    if (marcaId) where.marca = { id: marcaId };
    if (estado) where.estado = estado;

    const [items, total] = await this.repo.findAndCount({
      where,
      relations: { equipo: true, tipo: true, marca: true },
      take: limit,
      skip: (page - 1) * limit,
      order: { id: 'DESC' },
    });

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id }, relations: { equipo: true, tipo: true, marca: true } });
    if (!p) throw new NotFoundException('Periférico no encontrado');
    return p;
  }

  async update(id: string, dto: UpdatePerifericoDto) {
    const p = await this.findOne(id);

    if (dto.tipoId !== undefined) (p as any).tipo = dto.tipoId ? ({ id: dto.tipoId } as any) : null;
    if (dto.equipoId !== undefined) (p as any).equipo = dto.equipoId ? ({ id: dto.equipoId } as any) : null;
    if (dto.marcaId !== undefined)  (p as any).marca  = dto.marcaId ? ({ id: dto.marcaId } as any) : null;

    if (dto.modelo !== undefined) p.modelo = dto.modelo;
    if (dto.estado !== undefined) p.estado = dto.estado;
    if (dto.especificaciones !== undefined) p.especificaciones = dto.especificaciones;

    return this.repo.save(p);
  }

  async remove(id: string) {
    const p = await this.findOne(id);
    await this.repo.remove(p);
    return { deleted: true };
  }

  // Helpers de negocio
  async asignarAEquipo(id: string, equipoId: string) {
    const p = await this.findOne(id);
    (p as any).equipo = equipoId ? ({ id: equipoId } as any) : null;
    return this.repo.save(p);
  }

  async desasignarDeEquipo(id: string) {
    const p = await this.findOne(id);
    (p as any).equipo = null;
    return this.repo.save(p);
  }
}

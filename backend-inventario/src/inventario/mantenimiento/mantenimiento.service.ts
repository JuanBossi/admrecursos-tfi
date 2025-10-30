import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mantenimiento } from './entities/mantenimiento.entity';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';
import { QueryMantenimientoDto } from './dto/query-mantenimiento.dto';

@Injectable()
export class MantenimientoService {
  constructor(
    @InjectRepository(Mantenimiento)
    private readonly mantenimientoRepository: Repository<Mantenimiento>,
  ) {}

  /*async create(createMantenimientoDto: CreateMantenimientoDto) {
    const mantenimiento = this.mantenimientoRepository.create(createMantenimientoDto);
    return await this.mantenimientoRepository.save(mantenimiento);
  }*/

   async create(dto: CreateMantenimientoDto) {
    const mantenimiento = this.mantenimientoRepository.create({
      equipo: { id: String(dto.equipo_id) },
      tecnico: dto.tecnico_id ? { id: String(dto.tecnico_id) } : null,
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      fecha_programada: new Date(dto.fecha_programada),
      estado: 'PROGRAMADO',
      createdBy: dto.created_by ? { id: String(dto.created_by) } : null,
    });

    const saved = await this.mantenimientoRepository.save(mantenimiento);
    return { ok: true, data: saved };
  }


  async findAll(query: QueryMantenimientoDto) {
    const { page = 1, limit = 10, search, estado } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.mantenimientoRepository.createQueryBuilder('mantenimiento')
      .leftJoinAndSelect('mantenimiento.equipo', 'equipo')
      .leftJoinAndSelect('mantenimiento.tecnico', 'tecnico')
      .leftJoinAndSelect('mantenimiento.createdBy', 'createdBy')
      .leftJoinAndSelect('mantenimiento.updatedBy', 'updatedBy');

    if (search) {
      queryBuilder.where(
        '(mantenimiento.descripcion LIKE :search OR equipo.codigoInterno LIKE :search OR tecnico.nombre LIKE :search OR tecnico.apellido LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (estado) {
      queryBuilder.andWhere('mantenimiento.estado = :estado', { estado });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('mantenimiento.created_at', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }


  async findOne(id: string) {
    const mantenimiento = await this.mantenimientoRepository.findOne({
      where: { id: Number(id) },
      relations: ['equipo', 'tecnico', 'createdBy', 'updatedBy'],
    });

    if (!mantenimiento) {
      throw new NotFoundException('Mantenimiento no encontrado');
    }

    return { ok: true, data: mantenimiento };
  }

  async update(id: string, dto: UpdateMantenimientoDto) {
    const existente = await this.mantenimientoRepository.findOne({ where: { id: Number(id) } });
    if (!existente) {
      throw new NotFoundException('Mantenimiento no encontrado');
    }

    const partial: Partial<Mantenimiento> = {};

    if (dto.tipo !== undefined) partial.tipo = dto.tipo as any;
    if (dto.estado !== undefined) partial.estado = dto.estado as any;
    if (dto.descripcion !== undefined) partial.descripcion = dto.descripcion;
    if (dto.fecha_programada !== undefined)
      partial.fecha_programada = dto.fecha_programada ? new Date(dto.fecha_programada) : null;
    if (dto.fecha_inicio !== undefined)
      partial.fecha_inicio = dto.fecha_inicio ? new Date(dto.fecha_inicio) : null;
    if (dto.fecha_fin !== undefined)
      partial.fecha_fin = dto.fecha_fin ? new Date(dto.fecha_fin) : null;
    if (dto.tecnico_id !== undefined)
      partial.tecnico = dto.tecnico_id !== null ? ({ id: String(dto.tecnico_id) } as any) : null;
    if (dto.updated_by !== undefined)
      partial.updatedBy = dto.updated_by !== null ? ({ id: String(dto.updated_by) } as any) : null;

    const merged = this.mantenimientoRepository.merge(existente, partial);
    const saved = await this.mantenimientoRepository.save(merged);
    return { ok: true, data: saved };
  }

  async remove(id: string) {
    const existente = await this.mantenimientoRepository.findOne({ where: { id: Number(id) } });
    if (!existente) {
      throw new NotFoundException('Mantenimiento no encontrado');
    }

    await this.mantenimientoRepository.remove(existente);
    return { ok: true };
  }

  async proximos(dias: number) {
    const d = Number.isFinite(Number(dias)) ? Number(dias) : 30;


    const qb = this.mantenimientoRepository
      .createQueryBuilder('m')
      .leftJoin('m.equipo', 'e')       
      .leftJoin('m.tecnico', 't')      
      .select([
        'm.id AS id',
        'e.id AS equipoId',
        'e.codigo_interno AS equipo',
        'm.descripcion AS detalle',
        'm.fecha_programada AS fecha',
        't.nombre AS tecnico',
      ])
      .where('m.estado = :estado', { estado: 'PROGRAMADO' })
      .andWhere('m.fecha_programada IS NOT NULL')
      .andWhere('m.fecha_programada >= CURDATE()')
      .andWhere('m.fecha_programada <= DATE_ADD(CURDATE(), INTERVAL :dias DAY)', { dias: d })
      .orderBy('m.fecha_programada', 'ASC');

    const rows = await qb.getRawMany();
    return { ok: true, data: rows };
  }
}

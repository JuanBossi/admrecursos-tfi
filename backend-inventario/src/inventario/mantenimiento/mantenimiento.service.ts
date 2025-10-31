import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mantenimiento } from './entities/mantenimiento.entity';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto, EstadoMantenimiento } from './dto/update-mantenimiento.dto';
import { QueryMantenimientoDto } from './dto/query-mantenimiento.dto';
import { Equipo, EquipoEstado } from '../equipo/entities/equipo.entity';
import { HistorialCambios, HistorialAccion } from '../historial-cambios/entities/historial-cambios.entity';

@Injectable()
export class MantenimientoService {
  constructor(
    @InjectRepository(Mantenimiento)
    private readonly mantenimientoRepository: Repository<Mantenimiento>,
    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,
    @InjectRepository(HistorialCambios)
    private readonly historialRepository: Repository<HistorialCambios>,
  ) {}

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
    const { page = 1, limit = 10, search, estado, equipoId } = query;
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

    if (equipoId) {
      queryBuilder.andWhere('equipo.id = :equipoId', { equipoId: String(equipoId) });
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
    const existente = await this.mantenimientoRepository.findOne({ where: { id: Number(id) }, relations: ['equipo'] });
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

    const prevEstado = existente.estado;
    const merged = this.mantenimientoRepository.merge(existente, partial);
    const saved = await this.mantenimientoRepository.save(merged);

    // Side-effects: actualizar estado del equipo y registrar historial
    if (dto.estado !== undefined && dto.estado !== prevEstado) {
      const equipoId = String(existente.equipo?.id || '');
      const userId = dto.updated_by ? String(dto.updated_by) : undefined;

      if (equipoId) {
        if (dto.estado === EstadoMantenimiento.EN_PROGRESO) {
          await this.equipoRepository.update({ id: equipoId }, { estado: EquipoEstado.REPARACION } as any);
          await this.historialRepository.save(this.historialRepository.create({
            equipo: { id: equipoId } as any,
            accion: HistorialAccion.REPARACION,
            usuario: userId ? ({ id: userId } as any) : undefined,
            motivo: 'Mantenimiento en progreso',
          }));
        }

        if (dto.estado === EstadoMantenimiento.COMPLETO) {
          const result = (dto as any).resultado as ('REPARADO' | 'ROTO' | undefined);
          if (result === 'ROTO') {
          } else {
          
            await this.equipoRepository.update({ id: equipoId }, { estado: EquipoEstado.ACTIVO } as any);
            await this.historialRepository.save(this.historialRepository.create({
              equipo: { id: equipoId } as any,
              accion: HistorialAccion.REPARADO,
              usuario: userId ? ({ id: userId } as any) : undefined,
              motivo: 'Mantenimiento completo - equipo reparado',
            }));
          }
        }

        if (dto.estado === EstadoMantenimiento.CANCELADO) {
          // En cancelación, devolvemos el equipo a ACTIVO si estaba en reparación
          await this.equipoRepository.update({ id: equipoId }, { estado: EquipoEstado.ACTIVO } as any);
          await this.historialRepository.save(this.historialRepository.create({
            equipo: { id: equipoId } as any,
            accion: HistorialAccion.ACTIVO,
            usuario: userId ? ({ id: userId } as any) : undefined,
            motivo: 'Mantenimiento cancelado',
          }));
        }
      }
    }

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
    return rows;
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, ILike, LessThanOrEqual, Repository } from 'typeorm';
import { Equipo, EquipoEstado, EquipoTipo } from './entities/equipo.entity';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { BajaEquipoDto, UpdateEquipoDto } from './dto/update-equipo.dto';
import { QueryEquipoDto } from './dto/query-equipo.dto';
import { HistorialCambios, HistorialAccion } from '../historial-cambios/entities/historial-cambios.entity';

@Injectable()
export class EquipoService {
  constructor(
    @InjectRepository(Equipo) private repo: Repository<Equipo>,
    @InjectRepository(HistorialCambios) private histRepo: Repository<HistorialCambios>,
  ) {}

  async create(dto: CreateEquipoDto, userId?: string) {
    // Validación de unicidad de código interno con mensaje claro
    const exists = await this.repo.exists({ where: { codigoInterno: dto.codigoInterno } });
    if (exists) throw new BadRequestException('Ya existe un equipo con ese código interno');
    const equipo = this.repo.create({
      codigoInterno: dto.codigoInterno,
      tipo: dto.tipo,
      fechaCompra: dto.fechaCompra,
      garantia: dto.garantia,
      estado: dto.estado ?? EquipoEstado.ACTIVO,
      proveedor: dto.proveedorId ? ({ id: dto.proveedorId } as any) : undefined,
      area: dto.areaId ? ({ id: dto.areaId } as any) : undefined,
      empleadoAsignado: dto.empleadoAsignadoId ? ({ id: dto.empleadoAsignadoId } as any) : undefined,
    });
    const saved = await this.repo.save(equipo);
    // Registrar estado inicial
    await this.histRepo.save(this.histRepo.create({
      equipo: { id: String(saved.id) } as any,
      accion: HistorialAccion.ACTIVO,
      usuario: userId ? ({ id: String(userId) } as any) : undefined,
      motivo: 'Creación de equipo',
    }));
    return saved;
  }

  async findAll(q: QueryEquipoDto) {
    const { page = 1, limit = 10, search, tipo, estado, areaId, proveedorId, empleadoAsignadoId, garantiaAntesDe } = q;

    const where: FindOptionsWhere<Equipo> = {};
    if (search) where.codigoInterno = ILike(`%${search}%`);
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (areaId) where.area = { id: areaId } as any;
    if (proveedorId) where.proveedor = { id: proveedorId } as any;
    if (empleadoAsignadoId) where.empleadoAsignado = { id: empleadoAsignadoId } as any;
    if (garantiaAntesDe) where.garantia = LessThanOrEqual(garantiaAntesDe);

    const [items, total] = await this.repo.findAndCount({
      where,
      relations: { area: true, proveedor: true, empleadoAsignado: true },
      take: limit,
      skip: (page - 1) * limit,
      order: { codigoInterno: 'ASC' },
    });

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const equipo = await this.repo.findOne({
      where: { id },
      relations: { area: true, proveedor: true, empleadoAsignado: true },
    });
    if (!equipo) throw new NotFoundException('Equipo no encontrado');
    return equipo;
  }

  async update(id: string, dto: UpdateEquipoDto, userId?: string) {
    const equipo = await this.findOne(id);
    const estadoAnterior = equipo.estado;

    // Si intenta cambiar el código interno, validar que no esté usado por otro
    if (dto.codigoInterno !== undefined) {
      const nuevo = dto.codigoInterno;
      if (nuevo !== equipo.codigoInterno) {
        const dup = await this.repo.exists({ where: { codigoInterno: nuevo } });
        if (dup) throw new BadRequestException('Ya existe un equipo con ese código interno');
      }
    }

    if (dto.proveedorId !== undefined) {
      (equipo as any).proveedor = dto.proveedorId ? ({ id: dto.proveedorId } as any) : null;
    }
    if (dto.areaId !== undefined) {
      (equipo as any).area = dto.areaId ? ({ id: dto.areaId } as any) : null;
    }
    if (dto.empleadoAsignadoId !== undefined) {
      (equipo as any).empleadoAsignado = dto.empleadoAsignadoId ? ({ id: dto.empleadoAsignadoId } as any) : null;
    }

    if (dto.codigoInterno !== undefined) equipo.codigoInterno = dto.codigoInterno;
    if (dto.tipo !== undefined) equipo.tipo = dto.tipo;
    if (dto.fechaCompra !== undefined) equipo.fechaCompra = dto.fechaCompra;
    if (dto.garantia !== undefined) equipo.garantia = dto.garantia;
    if (dto.estado !== undefined) equipo.estado = dto.estado as any;

    const saved = await this.repo.save(equipo);

    // Si cambió el estado, registrar en historial
    if (dto.estado !== undefined && dto.estado !== estadoAnterior) {
      const accion =
        dto.estado === EquipoEstado.REPARACION
          ? HistorialAccion.REPARACION
          : dto.estado === EquipoEstado.ACTIVO
            ? HistorialAccion.ACTIVO
            : dto.estado === EquipoEstado.BAJA
              ? HistorialAccion.BAJA
              : undefined;
      if (accion) {
        await this.histRepo.save(this.histRepo.create({
          equipo: { id } as any,
          accion,
          usuario: userId ? ({ id: String(userId) } as any) : undefined,
          motivo: 'Cambio de estado',
        }));
      }
    }

    return saved;
  }

  async remove(id: string) {
    const equipo = await this.findOne(id);
    await this.repo.remove(equipo);
    return { deleted: true };
  }

  async darDeBaja(id: string, dto: BajaEquipoDto, userId?: string) {
    const equipo = await this.findOne(id);
    const estadoAnterior = equipo.estado;
    equipo.estado = EquipoEstado.BAJA;
    equipo.motivoBaja = dto.motivo;
    const saved = await this.repo.save(equipo);
    await this.histRepo.save(this.histRepo.create({
      equipo: { id } as any,
      accion: estadoAnterior === EquipoEstado.REPARACION ? HistorialAccion.ROTO : HistorialAccion.BAJA,
      motivo: dto.motivo,
      usuario: userId ? ({ id: String(userId) } as any) : undefined,
    }));
    return saved;
  }

  async garantiasPorVencer(dias: number) {
  const d = Number.isFinite(Number(dias)) ? Number(dias) : 30;


  const meta = await this.repo.query('SELECT DATABASE() AS db, CURDATE() AS today, NOW() AS now');

  const qb = this.repo
    .createQueryBuilder('e')
    .select([
      'e.id AS id',
      'e.codigo_interno AS nombre',
      'e.garantia AS venceEl',
      'DATEDIFF(e.garantia, CURDATE()) AS diasRestantes',
    ])
    .where('e.garantia IS NOT NULL')
    .andWhere('DATEDIFF(e.garantia, CURDATE()) BETWEEN 0 AND :dias', { dias: d })
    .orderBy('e.garantia', 'ASC');

  const rows = await qb.getRawMany<{
    id: number;
    nombre: string;   // <- codigo_interno
    venceEl: string;  // YYYY-MM-DD
    diasRestantes: number;
  }>();
  
  

  return { ok: true, data: rows };
}

  
}

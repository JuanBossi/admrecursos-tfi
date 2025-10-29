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

  async create(createMantenimientoDto: CreateMantenimientoDto) {
    const mantenimiento = this.mantenimientoRepository.create(createMantenimientoDto);
    return await this.mantenimientoRepository.save(mantenimiento);
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
      .orderBy('mantenimiento.createdAt', 'DESC')
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
      where: { id },
      relations: ['equipo', 'tecnico', 'createdBy', 'updatedBy'],
    });

    if (!mantenimiento) {
      throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
    }

    return mantenimiento;
  }

  async update(id: string, updateMantenimientoDto: UpdateMantenimientoDto) {
    const mantenimiento = await this.findOne(id);
    
    Object.assign(mantenimiento, updateMantenimientoDto);
    return await this.mantenimientoRepository.save(mantenimiento);
  }

  async remove(id: string) {
    const mantenimiento = await this.findOne(id);
    await this.mantenimientoRepository.remove(mantenimiento);
    return { message: 'Mantenimiento eliminado correctamente' };
  }
}

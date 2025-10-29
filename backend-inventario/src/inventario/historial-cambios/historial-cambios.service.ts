import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialCambios } from './entities/historial-cambios.entity';
import { CreateHistorialCambiosDto } from './dto/create-historial-cambios.dto';
import { QueryHistorialCambiosDto } from './dto/query-historial-cambios.dto';

@Injectable()
export class HistorialCambiosService {
  constructor(
    @InjectRepository(HistorialCambios)
    private readonly historialRepository: Repository<HistorialCambios>,
  ) {}

  async create(createHistorialDto: CreateHistorialCambiosDto) {
    const historial = this.historialRepository.create(createHistorialDto);
    return await this.historialRepository.save(historial);
  }

  async findAll(query: QueryHistorialCambiosDto) {
    const { page = 1, limit = 10, search, equipoId } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.historialRepository.createQueryBuilder('historial')
      .leftJoinAndSelect('historial.equipo', 'equipo')
      .leftJoinAndSelect('historial.usuario', 'usuario');

    if (equipoId) {
      queryBuilder.where('historial.equipo.id = :equipoId', { equipoId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(historial.motivo LIKE :search OR equipo.codigoInterno LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('historial.fecha', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const historial = await this.historialRepository.findOne({
      where: { id },
      relations: ['equipo', 'usuario'],
    });

    if (!historial) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }

    return historial;
  }

  async findByEquipo(equipoId: string) {
    return await this.historialRepository.find({
      where: { equipo: { id: equipoId } },
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    });
  }
}

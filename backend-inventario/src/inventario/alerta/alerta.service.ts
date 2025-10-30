import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from './entities/alerta.entity';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';
import { QueryAlertaDto } from './dto/query-alerta.dto';

@Injectable()
export class AlertaService {
  constructor(
    @InjectRepository(Alerta)
    private readonly alertaRepository: Repository<Alerta>,
  ) {}

  async create(createAlertaDto: CreateAlertaDto) {
    const alerta = this.alertaRepository.create({
      mensaje: createAlertaDto.mensaje,
      ...(createAlertaDto.equipoId
        ? { equipo: { id: String(createAlertaDto.equipoId) } as any }
        : {}),
    });
    const saved = await this.alertaRepository.save(alerta);
    return saved;
  }

  async findAll(query: QueryAlertaDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.alertaRepository.createQueryBuilder('alerta')
      .leftJoinAndSelect('alerta.equipo', 'equipo');

    if (search) {
      queryBuilder.where(
        '(alerta.mensaje LIKE :search OR equipo.codigoInterno LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('alerta.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const alerta = await this.alertaRepository.findOne({
      where: { id },
      relations: ['equipo'],
    });

    if (!alerta) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
    }

    return alerta;
  }

  async update(id: string, updateAlertaDto: UpdateAlertaDto) {
    const alerta = await this.findOne(id);
    if (updateAlertaDto.mensaje !== undefined) alerta.mensaje = updateAlertaDto.mensaje;
    if (updateAlertaDto.equipoId !== undefined) {
      alerta.equipo = updateAlertaDto.equipoId ? ({ id: String(updateAlertaDto.equipoId) } as any) : null as any;
    }
    const saved = await this.alertaRepository.save(alerta);
    return saved;
  }

  async remove(id: string) {
    const alerta = await this.findOne(id);
    await this.alertaRepository.remove(alerta);
    return { message: 'Alerta eliminada correctamente' };
  }
}

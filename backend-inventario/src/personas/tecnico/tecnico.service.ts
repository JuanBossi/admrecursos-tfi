import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tecnico } from './entities/tecnico.entity';
import { CreateTecnicoDto } from './dto/create-tecnico.dto';
import { UpdateTecnicoDto } from './dto/update-tecnico.dto';
import { QueryTecnicoDto } from './dto/query-tecnico.dto';

@Injectable()
export class TecnicoService {
  constructor(
    @InjectRepository(Tecnico)
    private readonly tecnicoRepository: Repository<Tecnico>,
  ) {}

  async create(createTecnicoDto: CreateTecnicoDto) {
    const tecnico = this.tecnicoRepository.create(createTecnicoDto);
    return await this.tecnicoRepository.save(tecnico);
  }

  async findAll(query: QueryTecnicoDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.tecnicoRepository.createQueryBuilder('tecnico');

    if (search) {
      queryBuilder.where(
        '(tecnico.nombre LIKE :search OR tecnico.apellido LIKE :search OR tecnico.dni LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('tecnico.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const tecnico = await this.tecnicoRepository.findOne({
      where: { id },
    });

    if (!tecnico) {
      throw new NotFoundException(`Técnico con ID ${id} no encontrado`);
    }

    return tecnico;
  }

  async update(id: string, updateTecnicoDto: UpdateTecnicoDto) {
    const tecnico = await this.findOne(id);
    
    Object.assign(tecnico, updateTecnicoDto);
    return await this.tecnicoRepository.save(tecnico);
  }

  async remove(id: string) {
    const tecnico = await this.findOne(id);
    await this.tecnicoRepository.remove(tecnico);
    return { message: 'Técnico eliminado correctamente' };
  }
}

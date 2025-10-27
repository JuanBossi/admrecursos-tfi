import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { TipoPeriferico } from './entities/tipo-periferico.entity';
import { CreateTipoPerifericoDto } from './dto/create-tipo-periferico.dto';
import { UpdateTipoPerifericoDto } from './dto/update-tipo-periferico.dto';
import { QueryTipoPerifericoDto } from './dto/query-tipo-periferico.dto';

@Injectable()
export class TipoPerifericoService {
  constructor(@InjectRepository(TipoPeriferico) private repo: Repository<TipoPeriferico>) {}

  async create(dto: CreateTipoPerifericoDto) {
    const dup = await this.repo.exists({ where: { nombre: ILike(dto.nombre) } });
    if (dup) throw new BadRequestException('El tipo de periférico ya existe');
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(q: QueryTipoPerifericoDto) {
    const { page = 1, limit = 10, search } = q;
    const where = search ? { nombre: ILike(`%${search}%`) } : {};
    const [items, total] = await this.repo.findAndCount({
      where, take: limit, skip: (page - 1) * limit, order: { nombre: 'ASC' },
    });
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const tp = await this.repo.findOne({ where: { id } });
    if (!tp) throw new NotFoundException('Tipo de periférico no encontrado');
    return tp;
  }

  async update(id: string, dto: UpdateTipoPerifericoDto) {
    const tp = await this.findOne(id);
    if (dto.nombre && dto.nombre !== tp.nombre) {
      const dup = await this.repo.exists({ where: { nombre: ILike(dto.nombre) } });
      if (dup) throw new BadRequestException('Ya existe otro tipo con ese nombre');
      tp.nombre = dto.nombre;
    }
    return this.repo.save(tp);
  }

  async remove(id: string) {
    const tp = await this.findOne(id);
    await this.repo.remove(tp);
    return { deleted: true };
  }
}

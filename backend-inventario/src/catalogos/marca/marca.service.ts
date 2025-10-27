import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Marca } from './entities/marca.entity';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { QueryMarcaDto } from './dto/query-marca.dto';

@Injectable()
export class MarcaService {
  constructor(@InjectRepository(Marca) private repo: Repository<Marca>) {}

  async create(dto: CreateMarcaDto) {
    const exists = await this.repo.exists({ where: { nombre: ILike(dto.nombre) } });
    if (exists) throw new BadRequestException('La marca ya existe');
    const marca = this.repo.create(dto);
    return this.repo.save(marca);
  }

  async findAll(q: QueryMarcaDto) {
    const { page = 1, limit = 10, search } = q;
    const where = search ? { nombre: ILike(`%${search}%`) } : {};
    const [items, total] = await this.repo.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { nombre: 'ASC' },
    });
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const marca = await this.repo.findOne({ where: { id } });
    if (!marca) throw new NotFoundException('Marca no encontrada');
    return marca;
  }

  async update(id: string, dto: UpdateMarcaDto) {
    const marca = await this.findOne(id);

    if (dto.nombre !== undefined && dto.nombre !== marca.nombre) {
      const dup = await this.repo.exists({ where: { nombre: ILike(dto.nombre) } });
      if (dup) throw new BadRequestException('Ya existe otra marca con ese nombre');
      marca.nombre = dto.nombre;
    }

    if (dto.descripcion !== undefined) marca.descripcion = dto.descripcion;

    return this.repo.save(marca);
  }

  async remove(id: string) {
    const marca = await this.findOne(id);
    await this.repo.remove(marca);
    return { deleted: true };
  }
}

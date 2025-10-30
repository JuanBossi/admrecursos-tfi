import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, DeepPartial } from 'typeorm';
import { Area } from './entities/area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreaService {
  constructor(@InjectRepository(Area) private repo: Repository<Area>) {}

  create(dto: CreateAreaDto) {
    const area = this.repo.create(dto);
    return this.repo.save(area);
  }

  async findAll(page = 1, limit = 10, search?: string) {
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
    const area = await this.repo.findOne({ where: { id } });
    if (!area) throw new NotFoundException('Área no encontrada');
    return area;
  }

  async update(id: string, dto: UpdateAreaDto) {
    const area = await this.findOne(id);
    Object.assign(area, dto);
    return this.repo.save(area);
  }

  async remove(id: string) {
    const area = await this.findOne(id);
    await this.repo.remove(area);
    return { deleted: true };
  }

  async seedDefaults(names?: string[]) {
    const defaults = (names && names.length ? names : ['Sistemas', 'Compras', 'Recursos Humanos']).map((n) => ({ nombre: n }));
    const created: Area[] = [];
    for (const def of defaults) {
      const exists = await this.repo.findOne({ where: { nombre: def.nombre } });
      if (!exists) {
        const a = this.repo.create(def as DeepPartial<Area>);
        created.push(await this.repo.save(a));
      }
    }
    const total = await this.repo.count();
    return { inserted: created.length, total };
  }
}

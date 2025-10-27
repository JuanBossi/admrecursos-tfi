import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { QueryProveedorDto } from './dto/query-proveedor.dto';

const normalizeCuit = (cuit: string) => cuit.replace(/\D/g, ''); // deja solo dígitos

@Injectable()
export class ProveedorService {
  constructor(@InjectRepository(Proveedor) private repo: Repository<Proveedor>) {}

  async create(dto: CreateProveedorDto) {
    const cuit = normalizeCuit(dto.cuit);
    const exists = await this.repo.exists({ where: { cuit } });
    if (exists) throw new BadRequestException('El CUIT ya está registrado');

    const prov = this.repo.create({ ...dto, cuit });
    return this.repo.save(prov);
  }

  async findAll(q: QueryProveedorDto) {
    const { page = 1, limit = 10, search } = q;
    const where = search
      ? [
          { razonSocial: ILike(`%${search}%`) },
          { cuit: ILike(`%${search.replace(/\D/g, '')}%`) },
          { contacto: ILike(`%${search}%`) },
        ]
      : undefined;

    const [items, total] = await this.repo.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { razonSocial: 'ASC' },
    });

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const prov = await this.repo.findOne({ where: { id } });
    if (!prov) throw new NotFoundException('Proveedor no encontrado');
    return prov;
  }

  async findByCuit(rawCuit: string) {
    const cuit = normalizeCuit(rawCuit);
    const prov = await this.repo.findOne({ where: { cuit } });
    if (!prov) throw new NotFoundException('Proveedor no encontrado');
    return prov;
  }

  async update(id: string, dto: UpdateProveedorDto) {
    const prov = await this.findOne(id);

    if (dto.cuit !== undefined) {
      const cuit = normalizeCuit(dto.cuit);
      if (cuit !== prov.cuit) {
        const dup = await this.repo.exists({ where: { cuit } });
        if (dup) throw new BadRequestException('El CUIT ya está registrado por otro proveedor');
      }
      prov.cuit = cuit;
    }

    if (dto.razonSocial !== undefined) prov.razonSocial = dto.razonSocial;
    if (dto.contacto !== undefined) prov.contacto = dto.contacto;
    if (dto.email !== undefined) prov.email = dto.email;
    if (dto.telefono !== undefined) prov.telefono = dto.telefono;
    if (dto.direccion !== undefined) prov.direccion = dto.direccion;

    return this.repo.save(prov);
  }

  async remove(id: string) {
    const prov = await this.findOne(id);
    await this.repo.remove(prov);
    return { deleted: true };
  }
}

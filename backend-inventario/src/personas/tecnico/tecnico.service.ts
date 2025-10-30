import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tecnico } from './entities/tecnico.entity';
import { CreateTecnicoDto } from './dto/create-tecnico.dto';
import { UpdateTecnicoDto } from './dto/update-tecnico.dto';
import { QueryTecnicoDto } from './dto/query-tecnico.dto';
import { Usuario } from '../../acceso/usuario/entities/usuario.entity';
import { Rol } from '../../acceso/rol/entities/rol.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TecnicoService {
  constructor(
    @InjectRepository(Tecnico)
    private readonly tecnicoRepository: Repository<Tecnico>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createTecnicoDto: CreateTecnicoDto) {
    const tecnico = this.tecnicoRepository.create(createTecnicoDto);
    const saved = await this.tecnicoRepository.save(tecnico);

    // Crear usuario asociado usando contacto como email/username y dni como password
    try {
      const email = (createTecnicoDto.contacto || '').trim();
      const dni = (createTecnicoDto.dni || '').trim();
      if (email && dni) {
        let user: Usuario | null = await this.usuarioRepository.findOne({ where: [{ email }, { username: email }] as any, relations: { roles: true } });

        // Asegurar rol Tecnico
        let rolTecnico = await this.rolRepository.findOne({ where: { nombre: 'Tecnico' } });
        if (!rolTecnico) {
          rolTecnico = await this.rolRepository.save(this.rolRepository.create({ nombre: 'Tecnico' }));
        }

        const passwordHash = await bcrypt.hash(dni, 10);
        if (!user) {
          user = this.usuarioRepository.create({
            username: email,
            email,
            passwordHash,
            activo: 1 as any,
            roles: [rolTecnico],
          } as any) as unknown as Usuario;
          // Vincular empleado_id al id del técnico según la convención del sistema
          // v�nculo omitido: empleado_id apunta a empleado, no t�cnico
        } else {
          // Garantiza rol y estado, y vinculación
          const names = (user.roles || []).map(r => r.nombre);
          if (!names.includes('Tecnico')) user.roles = [...(user.roles || []), rolTecnico];
          user.activo = 1 as any;
          if (!(user as any).empleado) // v�nculo omitido: empleado_id apunta a empleado, no t�cnico
          // No sobreescribo password si ya existe; opcionalmente podrías actualizarlo
          if (!user.passwordHash) user.passwordHash = passwordHash;
        }
        await this.usuarioRepository.save(user as Usuario);
      }
    } catch (e) {
      // No romper creación de técnico si falla la creación del usuario
      // console.error('No se pudo crear usuario para técnico:', e);
    }

    return saved;
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


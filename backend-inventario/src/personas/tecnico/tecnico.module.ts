import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tecnico } from './entities/tecnico.entity';
import { Usuario } from '../../acceso/usuario/entities/usuario.entity';
import { Rol } from '../../acceso/rol/entities/rol.entity';
import { TecnicoService } from './tecnico.service';
import { TecnicoController } from './tecnico.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tecnico, Usuario, Rol])],
  controllers: [TecnicoController],
  providers: [TecnicoService],
  exports: [TypeOrmModule],
})
export class TecnicoModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empleado } from './entities/empleado.entity';
import { Usuario } from '../../acceso/usuario/entities/usuario.entity';
import { Rol } from '../../acceso/rol/entities/rol.entity';
import { EmpleadoService } from './empleado.service';
import { EmpleadoController } from './empleado.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado, Usuario, Rol])],
  controllers: [EmpleadoController],
  providers: [EmpleadoService],
  exports: [TypeOrmModule],
})
export class EmpleadoModule {}

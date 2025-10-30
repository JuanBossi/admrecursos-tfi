import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Rol } from '../rol/entities/rol.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol])],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}



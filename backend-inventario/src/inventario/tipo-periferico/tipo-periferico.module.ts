import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoPeriferico } from './entities/tipo-periferico.entity';
import { TipoPerifericoService } from './tipo-periferico.service';
import { TipoPerifericoController } from './tipo-periferico.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoPeriferico])],
  controllers: [TipoPerifericoController],
  providers: [TipoPerifericoService],
  exports: [TypeOrmModule],
})
export class TipoPerifericoModule {}

import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('tipo_periferico')
@Unique('ux_tipo_periferico_nombre', ['nombre'])
export class TipoPeriferico {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 120 })
  nombre: string; // RAM, SSD, HDD, CPU, GPU, Teclado, Mouse, Monitor, etc.
}

import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';
import { Equipo } from '../../equipo/entities/equipo.entity';
import { TipoPeriferico } from '../../tipo-periferico/entities/tipo-periferico.entity';
import { Marca } from '../../../catalogos/marca/entities/marca.entity';

export enum PerifericoEstado { ACTIVO='ACTIVO', REPARACION='REPARACION', BAJA='BAJA' }

@Entity('periferico')
export class Periferico {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @ManyToOne(() => Equipo, e => e.id, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'equipo_id' })
  equipo?: Equipo | null;

  @ManyToOne(() => TipoPeriferico, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'tipo_id' })
  tipo!: TipoPeriferico;

  @ManyToOne(() => Marca, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'marca_id' })
  marca?: Marca | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  modelo?: string;

  @Column({ type: 'enum', enum: PerifericoEstado, default: PerifericoEstado.ACTIVO })
  estado: PerifericoEstado;

  @Column({ type: 'varchar', length: 250, nullable: true })
  especificaciones?: string; 

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

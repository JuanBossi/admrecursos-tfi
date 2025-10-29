import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Equipo } from '../../equipo/entities/equipo.entity';
import { Tecnico } from '../../../personas/tecnico/entities/tecnico.entity';
import { Usuario } from '../../../acceso/usuario/entities/usuario.entity';

export enum MantenimientoTipo {
  PREVENTIVO = 'Preventivo',
  CORRECTIVO = 'Correctivo',
}

export enum MantenimientoEstado {
  PROGRAMADO = 'PROGRAMADO',
  EN_PROGRESO = 'EN PROGRESO',
  COMPLETO = 'COMPLETO',
  CANCELADO = 'CANCELADO',
}

@Entity('mantenimiento')
export class Mantenimiento {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @ManyToOne(() => Equipo, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'equipo_id' })
  equipo: Equipo;

  @Column({
    type: 'enum',
    enum: MantenimientoTipo,
  })
  tipo: MantenimientoTipo;

  @Column({ type: 'varchar', length: 500 })
  descripcion: string;

  @ManyToOne(() => Tecnico, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico?: Tecnico;

  @Column({
    type: 'enum',
    enum: MantenimientoEstado,
    default: MantenimientoEstado.PROGRAMADO,
  })
  estado: MantenimientoEstado;

  @Column({ type: 'datetime', nullable: true })
  fechaProgramada?: Date;

  @Column({ type: 'datetime', nullable: true })
  fechaInicio?: Date;

  @Column({ type: 'datetime', nullable: true })
  fechaFin?: Date;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: Usuario;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: Usuario;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

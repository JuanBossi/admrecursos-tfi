import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Equipo } from '../../equipo/entities/equipo.entity';
import { Tecnico } from '../../../personas/tecnico/entities/tecnico.entity';
import { Usuario } from '../../../acceso/usuario/entities/usuario.entity';

@Entity('mantenimiento')
export class Mantenimiento {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne(() => Equipo, { onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'equipo_id' })
  equipo: Equipo;

  @ManyToOne(() => Tecnico, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: Tecnico | null;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: Usuario | null;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: Usuario | null;

  @Column({ type: 'enum', enum: ['Preventivo', 'Correctivo'] })
  tipo: 'Preventivo' | 'Correctivo';

  @Column({ type: 'varchar', length: 500 })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: ['PROGRAMADO', 'EN PROGRESO', 'COMPLETO', 'CANCELADO'],
    default: 'PROGRAMADO',
  })
  estado: 'PROGRAMADO' | 'EN PROGRESO' | 'COMPLETO' | 'CANCELADO';

  @Column({ type: 'datetime', nullable: true })
  fecha_programada: Date | null;

  @Column({ type: 'datetime', nullable: true })
  fecha_inicio: Date | null;

  @Column({ type: 'datetime', nullable: true })
  fecha_fin: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updated_at: Date;
}

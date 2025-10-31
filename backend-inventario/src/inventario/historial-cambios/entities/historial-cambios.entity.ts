import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Equipo } from '../../equipo/entities/equipo.entity';
import { Usuario } from '../../../acceso/usuario/entities/usuario.entity';

export enum HistorialAccion {
  REPARADO = 'REPARADO',
  ROTO = 'ROTO',
  BAJA = 'BAJA',
  ACTIVO = 'ACTIVO',
  REPARACION = 'REPARACION',
}

@Entity('historial_cambios')
export class HistorialCambios {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @ManyToOne(() => Equipo, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'equipo_id' })
  equipo: Equipo;

  @Column({
    type: 'enum',
    enum: HistorialAccion,
  })
  accion: HistorialAccion;

  @Column({ type: 'varchar', length: 250, nullable: true })
  motivo?: string;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Area } from '../../../catalogos/area/entities/area.entity';
// (Cuando crees estos módulos, importa sus entidades reales)
import { Proveedor } from '../../../catalogos/proveedor/entities/proveedor.entity';
import { Empleado } from '../../../personas/empleado/entities/empleado.entity';

export enum EquipoTipo { PC='PC', NOTEBOOK='NOTEBOOK', SERVIDOR='SERVIDOR' }
export enum EquipoEstado { ACTIVO='ACTIVO', REPARACION='REPARACION', BAJA='BAJA' }

@Entity('equipo')
@Unique('ux_equipo_codigo', ['codigoInterno'])
export class Equipo {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @ManyToOne(() => Proveedor, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor?: Proveedor;

  @ManyToOne(() => Area, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'area_id' })
  area?: Area;

  @ManyToOne(() => Empleado, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'empleado_asignado_id' })
  empleadoAsignado?: Empleado;

  @Column({ name: 'codigo_interno', type: 'varchar', length: 60 })
  codigoInterno: string;

  @Column({ type: 'enum', enum: EquipoTipo, default: EquipoTipo.PC })
  tipo: EquipoTipo;

  @Column({ type: 'date', nullable: true })
  fechaCompra?: string; // YYYY-MM-DD

  @Column({ type: 'date', nullable: true })
  garantia?: string;    // YYYY-MM-DD (fin de garantía)

  @Column({ type: 'enum', enum: EquipoEstado, default: EquipoEstado.ACTIVO })
  estado: EquipoEstado;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne,
  JoinTable, PrimaryGeneratedColumn, Unique, UpdateDateColumn, RelationId
} from 'typeorm';
import { Empleado } from '../../../personas/empleado/entities/empleado.entity';
import { Rol } from '../../rol/entities/rol.entity';

@Entity('usuario')
@Unique('ux_usuario_username', ['username'])
@Unique('ux_usuario_email', ['email'])
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 80 })
  username: string;

  @Column({ type: 'varchar', length: 180 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @ManyToOne(() => Empleado, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'empleado_id' })
  empleado?: Empleado | null;

  // Si el sistema usa el mismo empleado_id para referir a Técnico cuando el rol es 'Tecnico',
  // este RelationId nos permite acceder al valor bruto para resolver Técnico manualmente.
  @RelationId((u: Usuario) => u.empleado)
  empleadoId?: string;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  activo: number; // 1 = activo, 0 = inactivo

  @ManyToMany(() => Rol)
  @JoinTable({
    name: 'usuario_rol',
    joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'rol_id', referencedColumnName: 'id' },
  })
  roles: Rol[];

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

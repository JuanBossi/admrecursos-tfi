import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('rol')
@Unique('ux_rol_nombre', ['nombre'])
export class Rol {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 80 })
  nombre: string; // Administrador, Tecnico, Consulta

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion?: string;
}

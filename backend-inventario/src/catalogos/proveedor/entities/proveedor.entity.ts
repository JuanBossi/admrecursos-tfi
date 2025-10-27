import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('proveedor')
@Unique('ux_proveedor_cuit', ['cuit'])
export class Proveedor {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'razon_social', type: 'varchar', length: 200 })
  razonSocial: string;

  @Column({ type: 'varchar', length: 20 })
  cuit: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  contacto?: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  telefono?: string;

  @Column({ type: 'varchar', length: 220, nullable: true })
  direccion?: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

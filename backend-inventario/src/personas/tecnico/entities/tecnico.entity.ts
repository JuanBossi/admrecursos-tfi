import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TecnicoTipoContrato {
  INTERNO = 'INTERNO',
  EXTERNO = 'EXTERNO',
}

@Entity('tecnico')
export class Tecnico {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', length: 120 })
  apellido: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  dni: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  contacto?: string;

  @Column({
    type: 'enum',
    enum: TecnicoTipoContrato,
    default: TecnicoTipoContrato.INTERNO,
  })
  tipoContrato: TecnicoTipoContrato;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

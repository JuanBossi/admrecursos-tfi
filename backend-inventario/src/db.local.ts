import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

/**
 * Ajustá estas constantes a tu MySQL local.
 * Asegurate de tener creada la DB `inventario` (o poné `synchronize: true` para crear tablas).
 */
export const DB_LOCAL: TypeOrmModuleOptions = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'inventario',
  // Carga automática de entidades *.entity.ts
  autoLoadEntities: true,
  // Solo local: construye/actualiza tablas a partir de entidades
  synchronize: true,
  // Útil para ver las consultas en consola local
  logging: ['error', 'warn'],
  // Mantiene snake_case en DB
  namingStrategy: new SnakeNamingStrategy(),
};

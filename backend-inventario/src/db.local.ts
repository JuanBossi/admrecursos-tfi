import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';


export const DB_LOCAL: TypeOrmModuleOptions = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'inventario',
  autoLoadEntities: true,
  synchronize: true,
  logging: ['error', 'warn'],
  namingStrategy: new SnakeNamingStrategy(),
};

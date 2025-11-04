// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_LOCAL } from './db.local';
import { AreaModule } from './catalogos/area/area.module';
import { EquipoModule } from './inventario/equipo/equipo.module';
import { ProveedorModule } from './catalogos/proveedor/proveedor.module';
import { EmpleadoModule } from './personas/empleado/empleado.module';
import { TecnicoModule } from './personas/tecnico/tecnico.module';
import { MarcaModule } from './catalogos/marca/marca.module';
import { TipoPerifericoModule } from './inventario/tipo-periferico/tipo-periferico.module';
import { PerifericoModule } from './inventario/periferico/periferico.module';
import { AlertaModule } from './inventario/alerta/alerta.module';
import { MantenimientoModule } from './inventario/mantenimiento/mantenimiento.module';
import { HistorialCambiosModule } from './inventario/historial-cambios/historial-cambios.module';
import { RolModule } from './acceso/rol/rol.module';
import { UsuarioModule } from './acceso/usuario/usuario.module';
import { AuthModule } from './acceso/auth/auth.module';
import { AuthGuard } from './acceso/auth/guards/auth.guard';
import { RolesGuard } from './acceso/auth/guards/roles.guard';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';


const isProd = process.env.DB_HOST || process.env.DATABASE_URL;

// Config TypeORM para producción (MySQL externo por TCP)
const DB_PROD = {
  type: 'mysql' as const,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  // Para demo podés dejar synchronize en true; en prod real: false + migraciones
  synchronize: process.env.TYPEORM_SYNC === 'true', 
  logging: ['error', 'warn'] as const,
  namingStrategy: new SnakeNamingStrategy(),
   extra: {
    // SSL requerido por Aiven (mysql2):
    ssl: {
      // Para demo suele alcanzar sólo con esto; si Aiven te da un CA, podemos agregar 'ca'
      rejectUnauthorized: (process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'true') === 'true',
      ca: process.env.DB_CA && Buffer.from(process.env.DB_CA, 'base64').toString('utf8'),
      minVersion: 'TLSv1.2',
    },
  },
};

@Module({
  imports: [TypeOrmModule.forRoot(isProd ? (DB_PROD as any) : DB_LOCAL),
    AreaModule,
    MarcaModule,
    EquipoModule,
    ProveedorModule,
    EmpleadoModule,
    TecnicoModule,
    TipoPerifericoModule,
    PerifericoModule,
    AlertaModule,
    MantenimientoModule,
    HistorialCambiosModule,
    RolModule,
    UsuarioModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

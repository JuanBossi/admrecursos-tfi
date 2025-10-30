// src/app.module.ts
import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forRoot(DB_LOCAL),
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
})
export class AppModule {}

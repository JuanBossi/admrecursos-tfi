import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { DB_LOCAL } from '../db.local';
import { Area } from '../catalogos/area/entities/area.entity';
import { Marca } from '../catalogos/marca/entities/marca.entity';
import { Proveedor } from '../catalogos/proveedor/entities/proveedor.entity';
import { Equipo, EquipoEstado, EquipoTipo } from '../inventario/equipo/entities/equipo.entity';
import { Empleado } from '../personas/empleado/entities/empleado.entity';
import { TipoPeriferico } from '../inventario/tipo-periferico/entities/tipo-periferico.entity';
import { Periferico, PerifericoEstado } from '../inventario/periferico/entities/periferico.entity';

function onlyDigits(s: string) { return s.replace(/\D/g, ''); }

function cuitLike(n: number) { return `${20 + (n % 10)}-${(10000000 + (n*123456)%89999999).toString().slice(0,8)}-${(n%9)+1}`; }

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function main() {
  const ds = new DataSource({
    ...(DB_LOCAL as any),
    // Ensure entities are available for DataSource (autoLoadEntities doesn't apply here)
    entities: [Area, Marca, Proveedor, Empleado, Equipo, TipoPeriferico, Periferico],
    synchronize: true,
  });
  await ds.initialize();
  const areaRepo = ds.getRepository(Area);
  const marcaRepo = ds.getRepository(Marca);
  const provRepo = ds.getRepository(Proveedor);
  const equipoRepo = ds.getRepository(Equipo);
  const tipoPerifRepo = ds.getRepository(TipoPeriferico);
  const perifRepo = ds.getRepository(Periferico);

  // Seed base catalogs
  const areaNames = ['Administración', 'Ventas', 'Soporte', 'Desarrollo', 'RRHH'];
  const marcaNames = ['Dell', 'HP', 'Lenovo', 'Acer', 'Asus', 'Samsung', 'LG', 'Kingston', 'Crucial', 'Logitech'];
  const tiposPerifs = ['RAM', 'SSD', 'HDD', 'CPU', 'GPU', 'Teclado', 'Mouse', 'Monitor'];

  const areas = await Promise.all(areaNames.map(async (nombre) => {
    let a = await areaRepo.findOne({ where: { nombre } });
    if (!a) { a = areaRepo.create({ nombre }); await areaRepo.save(a); }
    return a;
  }));

  const marcas = await Promise.all(marcaNames.map(async (nombre) => {
    let m = await marcaRepo.findOne({ where: { nombre } });
    if (!m) { m = marcaRepo.create({ nombre }); await marcaRepo.save(m); }
    return m;
  }));

  const tipos = await Promise.all(tiposPerifs.map(async (nombre) => {
    let t = await tipoPerifRepo.findOne({ where: { nombre } });
    if (!t) { t = tipoPerifRepo.create({ nombre }); await tipoPerifRepo.save(t); }
    return t;
  }));

  // Proveedores
  const proveedores: Proveedor[] = [];
  for (let i = 1; i <= 5; i++) {
    const razonSocial = `Proveedor ${i}`;
    const cuit = cuitLike(i);
    let p = await provRepo.findOne({ where: { cuit } });
    if (!p) {
      p = provRepo.create({ razonSocial, cuit, email: `prov${i}@mail.com`, telefono: `11-${4000 + i}000`, direccion: `Calle ${i} #${100 + i}` });
      await provRepo.save(p);
    }
    proveedores.push(p);
  }

  // Equipos
  const equipos: Equipo[] = [];
  for (let i = 1; i <= 15; i++) {
    const codigoInterno = `EQ-${String(i).padStart(4, '0')}`;
    let eq = await equipoRepo.findOne({ where: { codigoInterno } });
    if (!eq) {
      const tipo = [EquipoTipo.PC, EquipoTipo.NOTEBOOK, EquipoTipo.SERVIDOR][i % 3];
      const estado = EquipoEstado.ACTIVO;
      const fechaCompra = new Date(); fechaCompra.setMonth(fechaCompra.getMonth() - (i * 3));
      const garantia = new Date(fechaCompra); garantia.setFullYear(garantia.getFullYear() + 2);
      eq = equipoRepo.create({
        codigoInterno,
        tipo,
        estado,
        proveedor: rand(proveedores),
        area: rand(areas),
        empleadoAsignado: undefined,
        fechaCompra: fechaCompra.toISOString().substring(0, 10),
        garantia: garantia.toISOString().substring(0, 10),
      });
      await equipoRepo.save(eq);
    }
    equipos.push(eq);
  }

  // Periféricos asociados a equipos
  const tipoByName = Object.fromEntries(tipos.map(t => [t.nombre, t] as const));

  for (const eq of equipos) {
    // RAM (1-2)
    const nRam = randInt(1, 2);
    for (let j = 0; j < nRam; j++) {
      const modelo = `${rand(['Kingston Fury', 'Crucial Ballistix', 'Corsair Vengeance'])} ${[8,16,32][j%3]}GB`;
      const existente = await perifRepo.findOne({ where: { modelo, equipo: { id: eq.id } as any } });
      if (!existente) {
        const p = perifRepo.create({
          equipo: eq,
          tipo: tipoByName['RAM'],
          marca: rand(marcas),
          modelo,
          estado: PerifericoEstado.ACTIVO,
          especificaciones: JSON.stringify({ capacidad_gb: [8,16,32][j%3], tecnologia: 'DDR4', frecuencia_mhz: [2666, 3000, 3200][j%3] })
        });
        await perifRepo.save(p);
      }
    }

    // Almacenamiento (1)
    const isSSD = Math.random() < 0.7;
    const pAlm = perifRepo.create({
      equipo: eq,
      tipo: isSSD ? tipoByName['SSD'] : tipoByName['HDD'],
      marca: rand(marcas),
      modelo: isSSD ? `SSD ${rand(['Kingston', 'Crucial'])} ${rand([240,480,960])}GB` : `HDD ${rand(['WD', 'Seagate'])} ${rand([500,1000,2000])}GB` ,
      estado: PerifericoEstado.ACTIVO,
      especificaciones: JSON.stringify({ interfaz: isSSD ? 'SATA' : 'SATA', capacidad_gb: rand([240,480,960,500,1000,2000]) })
    });
    await perifRepo.save(pAlm);

    // Teclado & Mouse
    for (const nombre of ['Teclado','Mouse']) {
      const p = perifRepo.create({
        equipo: eq,
        tipo: tipoByName[nombre],
        marca: rand(marcas),
        modelo: `${nombre} ${rand(['Logitech','Genius','HP'])}`,
        estado: PerifericoEstado.ACTIVO,
      });
      await perifRepo.save(p);
    }

    // Monitor (50%)
    if (Math.random() < 0.5) {
      const p = perifRepo.create({
        equipo: eq,
        tipo: tipoByName['Monitor'],
        marca: rand(marcas),
        modelo: `${rand(['Samsung','LG','AOC'])} ${rand([22,24,27])}"`,
        estado: PerifericoEstado.ACTIVO,
        especificaciones: JSON.stringify({ resolucion: rand(['1920x1080','2560x1440']), hz: rand([60,75,144]) })
      });
      await perifRepo.save(p);
    }
  }

  console.log('Seed completado:');
  console.log(`Areas: ${areas.length}, Marcas: ${marcas.length}, Tipos: ${tipos.length}, Proveedores: ${proveedores.length}, Equipos: ${equipos.length}`);

  await ds.destroy();
}

main().catch((e) => { console.error(e); process.exit(1); });

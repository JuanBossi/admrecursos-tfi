# Manual de Usuario - Sistema de Gestión de Inventario

## Índice
1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Dashboard](#dashboard)
4. [Gestión de Equipos](#gestión-de-equipos)
5. [Gestión de Mantenimientos](#gestión-de-mantenimientos)
6. [Gestión de Periféricos](#gestión-de-periféricos)
7. [Gestión de Alertas](#gestión-de-alertas)
8. [Gestión de Empleados](#gestión-de-empleados)
9. [Gestión de Proveedores](#gestión-de-proveedores)
10. [Gestión de Técnicos](#gestión-de-técnicos)
11. [Historial de Equipos](#historial-de-equipos)
12. [Permisos por Rol](#permisos-por-rol)

---

## Introducción

Este manual proporciona instrucciones detalladas para el uso del Sistema de Gestión de Inventario, diseñado para administrar equipos informáticos, mantenimientos, periféricos, alertas y recursos humanos relacionados con el inventario tecnológico de una organización.

---

## Acceso al Sistema

### Inicio de Sesión

1. **Ubicación**: Al abrir la aplicación, se mostrará automáticamente la página de inicio de sesión.

2. **Credenciales requeridas**:
   - **Usuario o Email**: Ingrese su nombre de usuario o dirección de correo electrónico.
   - **Contraseña**: Ingrese su contraseña.

3. **Proceso de inicio de sesión**:
   - Complete ambos campos.
   - Haga clic en el botón **"Ingresar"**.
   - Si las credenciales son correctas, será redirigido al Dashboard principal.

4. **Manejo de errores**:
   - Si las credenciales son incorrectas, aparecerá un mensaje de error en rojo.
   - Verifique que el nombre de usuario y la contraseña sean correctos.
   - Intente nuevamente.

### Cerrar Sesión

- Haga clic en el botón **"Salir"** ubicado en la esquina superior derecha del panel.
- Será redirigido automáticamente a la página de inicio de sesión.

---

## Dashboard

El Dashboard es la página principal del sistema y proporciona una vista general de la información más importante.

### Componentes del Dashboard

#### 1. Tarjetas de Resumen (Superior)
Muestra cuatro indicadores principales:

- **💻 Equipos totales**: Total de equipos registrados en el sistema. Hacer clic lleva a la lista completa.
- **✅ Equipos activos**: Cantidad de equipos en estado ACTIVO.
- **🔧 En reparación**: Equipos actualmente en reparación.
- **⚠️ Alertas activas**: Número de alertas pendientes (resaltadas en rojo si hay alertas).

**Uso**: Haga clic en cualquier tarjeta para navegar directamente a la sección correspondiente con los filtros aplicados.

#### 2. Garantías por Vencer
- Muestra equipos cuyas garantías vencen en los próximos 30 días.
- Información mostrada:
  - Nombre/Código del equipo (enlace al detalle)
  - Fecha de vencimiento
  - Días restantes (con código de colores: rojo ≤7 días, amarillo ≤15 días, verde >15 días)
- Enlace "Ver todos →" para ver la lista completa.

#### 3. Mantenimientos Próximos
- Lista de mantenimientos programados próximos.
- Información mostrada:
  - Fecha programada
  - Equipo asociado (enlace al detalle)
  - Descripción del mantenimiento
  - Técnico asignado
- Enlace "Ver todos →" para ver la lista completa.

### Actualización Automática
El Dashboard se actualiza automáticamente cuando:
- Usted navega a esta página.
- La ventana del navegador recupera el foco.

---

## Gestión de Equipos

La sección de Equipos permite gestionar todos los equipos informáticos del inventario.

### Visualización de Equipos

1. **Lista de equipos**: Tabla con la siguiente información:
   - Código Interno
   - Tipo (PC, Laptop, etc.)
   - Área
   - Empleado Asignado
   - Estado (ACTIVO, REPARACION, BAJA, etc.)
   - Fecha de Compra
   - Garantía (fecha de vencimiento)

2. **Paginación**: Navegue entre páginas usando los botones "Anterior" y "Siguiente".

### Filtros Disponibles

- **Buscar**: Busque por código interno, tipo o cualquier texto relacionado.
- **Área**: Filtre por área específica.
- **Estado**: Filtre por estado del equipo (ACTIVO, REPARACION, BAJA, etc.).
- **Mostrar por página**: Seleccione cuántos elementos mostrar (5, 10, 25, 50).

### Acciones Disponibles

#### Para Administradores y Técnicos:

1. **Agregar Equipo**:
   - Haga clic en el botón **"+ Agregar Equipo"**.
   - Complete el formulario:
     - Código Interno* (obligatorio)
     - Tipo (PC, Laptop, Servidor, etc.)
     - Proveedor
     - Área
     - Empleado Asignado
     - Estado
     - Fecha de Compra
     - Garantía (fecha de vencimiento)
   - Haga clic en **"Guardar"**.

2. **Editar Equipo**:
   - En la fila del equipo, haga clic en **"Editar"**.
   - Modifique los campos necesarios en el modal.
   - Haga clic en **"Guardar"**.

3. **Dar de Baja**:
   - Haga clic en **"Dar de Baja"** en la fila del equipo.
   - Ingrese el motivo de la baja (obligatorio).
   - Confirme la acción.

4. **Ver Historial**:
   - Haga clic en **"Ver Historial"** para ver todo el historial de mantenimientos y cambios del equipo.

5. **Ver Periféricos**:
   - Haga clic en **"Ver Periféricos"** para ver los periféricos asignados al equipo.

#### Para Empleados:
- Solo visualización (sin edición ni creación).

### Exportación de Datos

- **Exportar Excel**: Descarga un archivo CSV con todos los equipos visibles.
- **Exportar PDF**: Genera un PDF imprimible con la lista de equipos.

---

## Gestión de Mantenimientos

Esta sección permite programar, gestionar y dar seguimiento a los mantenimientos de equipos.

### Visualización de Mantenimientos

La tabla muestra:
- ID
- Equipo (con código interno)
- Tipo (Preventivo/Correctivo)
- Estado (PROGRAMADO, EN PROGRESO, COMPLETO, CANCELADO)
- Fecha Programada
- Descripción
- Técnico Asignado
- Resultado (si está completo: REPARADO/ROTO)

### Filtros Disponibles

- **Buscar**: Búsqueda general por texto.
- **Equipo**: Filtre por equipo específico.
- **Estado**: Filtre por estado del mantenimiento.
- **Mostrar por página**: Cantidad de elementos por página.

### Acciones Disponibles

#### Para Administradores y Técnicos:

1. **Crear Mantenimiento**:
   - Haga clic en **"+ Agregar Mantenimiento"**.
   - Complete el formulario:
     - Equipo* (seleccione de la lista)
     - Fecha Programada*
     - Tipo (Preventivo o Correctivo)
     - Descripción
   - Haga clic en **"Guardar"**.

2. **Empezar Mantenimiento**:
   - Para mantenimientos en estado PROGRAMADO, haga clic en **"Empezar"**.
   - El estado cambiará a "EN PROGRESO" y se registrará la fecha de inicio.

3. **Completar Mantenimiento**:
   - Para mantenimientos "EN PROGRESO", haga clic en **"Completar"**.
   - Seleccione el resultado:
     - **ACTIVO**: Equipo reparado y activo.
     - **BAJA**: Equipo dado de baja (deberá ingresar motivo).
   - Confirme la acción.

4. **Cancelar Mantenimiento**:
   - Solo para mantenimientos PROGRAMADO.
   - Haga clic en **"Cancelar"** para cancelar el mantenimiento.

#### Para Empleados:
- Solo visualización.

### Exportación de Datos

- **Exportar Excel**: Descarga CSV con los mantenimientos visibles.
- **Exportar PDF**: Genera PDF imprimible.

---

## Gestión de Periféricos

Esta sección permite gestionar periféricos (monitores, teclados, mouse, etc.) asociados o independientes de equipos.

### Visualización de Periféricos

La tabla muestra:
- ID
- Modelo
- Tipo
- Marca
- Equipo (si está asignado)
- Especificaciones

### Filtros Disponibles

- **Buscar**: Busque por modelo, marca, etc.
- **Tipo**: Filtre por tipo de periférico.
- **Marca**: Filtre por marca.
- **Equipo**: Filtre por equipo asignado.
- **Mostrar por página**: Cantidad de elementos por página.

### Acciones Disponibles

#### Para Administradores y Técnicos:

1. **Agregar Periférico**:
   - Haga clic en **"+ Agregar periferico"**.
   - Complete el formulario:
     - Tipo* (obligatorio)
     - Marca (opcional)
     - Equipo (asignar a un equipo o dejar sin asignar)
     - Modelo
     - Especificaciones (texto libre)
   - Haga clic en **"Guardar"**.

2. **Editar Periférico**:
   - Haga clic en **"Editar"** en la fila del periférico.
   - Modifique los campos necesarios.
   - Haga clic en **"Guardar"**.

3. **Asignar a Equipo**:
   - Para periféricos sin asignar, haga clic en **"Asignar"**.
   - Seleccione el equipo en el modal.
   - Confirme.

4. **Eliminar Periférico**:
   - Haga clic en **"Eliminar"**.
   - Confirme la eliminación.

#### Para Empleados:
- Solo visualización.

### Exportación de Datos

- **Exportar Excel**: Descarga CSV.
- **Exportar PDF**: Genera PDF imprimible.

---

## Gestión de Alertas

Las alertas permiten registrar notificaciones importantes sobre equipos o situaciones generales.

### Visualización de Alertas

La tabla muestra:
- Mensaje de la alerta
- Equipo asociado (si aplica)
- Fecha de Creación
- Acciones disponibles

### Filtros Disponibles

- **Buscar**: Busque por mensaje o equipo (con debounce de 2 segundos).
- **Mostrar por página**: Cantidad de elementos por página.

**Nota**: El campo de búsqueda espera 2 segundos después de dejar de escribir antes de realizar la búsqueda para evitar múltiples peticiones.

### Acciones Disponibles

#### Para Empleados, Técnicos y Administradores:

1. **Agregar Alerta**:
   - Haga clic en **"+ Agregar Alerta"**.
   - Complete el formulario:
     - Mensaje* (obligatorio, descripción de la alerta)
     - Equipo (opcional, puede seleccionar un equipo específico o dejar "Sin equipo específico")
   - Haga clic en **"Guardar"**.

#### Para Técnicos y Administradores:

2. **Editar Alerta**:
   - Haga clic en **"Editar"** en la fila de la alerta.
   - Modifique el mensaje o equipo asociado.
   - Haga clic en **"Guardar"**.

3. **Eliminar Alerta**:
   - Haga clic en **"Eliminar"**.
   - Confirme la eliminación.

#### Para Empleados:
- Solo pueden crear alertas, no editarlas ni eliminarlas.

---

## Gestión de Empleados

**Solo visible para Administradores**

Esta sección permite gestionar los empleados de la organización.

### Visualización de Empleados

La tabla muestra información básica de los empleados registrados.

### Acciones Disponibles

1. **Agregar Empleado**:
   - Haga clic en **"+ Agregar Empleado"**.
   - Complete el formulario con los datos del empleado.
   - Guarde.

2. **Editar Empleado**:
   - Haga clic en **"Editar"** en la fila del empleado.
   - Modifique los datos necesarios.
   - Guarde.

3. **Eliminar Empleado**:
   - Haga clic en **"Eliminar"**.
   - Confirme.

---

## Gestión de Proveedores

**Visible para Administradores y Técnicos**

Esta sección permite gestionar los proveedores de equipos y servicios.

### Visualización de Proveedores

La tabla muestra información de los proveedores registrados.

### Acciones Disponibles

1. **Agregar Proveedor**:
   - Haga clic en **"+ Agregar Proveedor"**.
   - Complete el formulario con los datos del proveedor.
   - Guarde.

2. **Editar Proveedor**:
   - Haga clic en **"Editar"**.
   - Modifique los datos.
   - Guarde.

3. **Eliminar Proveedor**:
   - Haga clic en **"Eliminar"**.
   - Confirme.

---

## Gestión de Técnicos

**Solo visible para Administradores**

Esta sección permite gestionar los técnicos que realizan mantenimientos.

### Visualización de Técnicos

La tabla muestra información de los técnicos registrados.

### Acciones Disponibles

1. **Agregar Técnico**:
   - Haga clic en **"+ Agregar Técnico"**.
   - Complete el formulario.
   - Guarde.

2. **Editar Técnico**:
   - Haga clic en **"Editar"**.
   - Modifique los datos.
   - Guarde.

3. **Eliminar Técnico**:
   - Haga clic en **"Eliminar"**.
   - Confirme.

---

## Historial de Equipos

Esta página muestra el historial completo de un equipo específico, incluyendo:

- **Cambios de estado**: Historial de cambios de estado del equipo.
- **Mantenimientos**: Todos los mantenimientos realizados al equipo.
- **Asignaciones**: Cambios en la asignación a empleados o áreas.
- **Bajas**: Si el equipo fue dado de baja, se muestra el motivo y fecha.

### Acceso

- Desde la lista de equipos, haga clic en **"Ver Historial"** en la fila del equipo deseado.
- O acceda directamente mediante la URL: `/equipos/:id/historial`

### Información Mostrada

Cada entrada del historial incluye:
- Fecha y hora del evento
- Tipo de evento
- Descripción/detalles
- Usuario que realizó la acción (si aplica)

---

## Permisos por Rol

El sistema tiene tres tipos de roles con diferentes niveles de acceso:

### 🔷 Administrador
**Acceso completo a todas las funcionalidades:**
- ✅ Ver y gestionar Equipos
- ✅ Ver y gestionar Mantenimientos
- ✅ Ver y gestionar Periféricos
- ✅ Ver y gestionar Alertas (crear, editar, eliminar)
- ✅ Ver y gestionar Empleados
- ✅ Ver y gestionar Proveedores
- ✅ Ver y gestionar Técnicos
- ✅ Ver Dashboard completo
- ✅ Ver Historial de equipos

### 🔷 Técnico
**Acceso a gestión operativa:**
- ✅ Ver y gestionar Equipos
- ✅ Ver y gestionar Mantenimientos
- ✅ Ver y gestionar Periféricos
- ✅ Ver y gestionar Alertas (crear, editar, eliminar)
- ✅ Ver y gestionar Proveedores
- ❌ No puede gestionar Empleados
- ❌ No puede gestionar Técnicos
- ✅ Ver Dashboard completo
- ✅ Ver Historial de equipos

### 🔷 Empleado
**Acceso de solo lectura con capacidad de crear alertas:**
- ✅ Ver Equipos (sin edición)
- ✅ Ver Mantenimientos (sin edición)
- ✅ Ver Periféricos (sin edición)
- ✅ Crear Alertas (sin editar ni eliminar)
- ❌ No puede gestionar Empleados
- ❌ No puede gestionar Proveedores
- ❌ No puede gestionar Técnicos
- ✅ Ver Dashboard (información limitada)

---

## Consejos de Uso

### Búsquedas Eficientes

- Use los filtros para reducir la cantidad de resultados.
- En campos de búsqueda con debounce (como Alertas), espere 2 segundos después de escribir para ver los resultados.
- Combine múltiples filtros para búsquedas más específicas.

### Exportación de Datos

- Use la exportación a Excel (CSV) cuando necesite trabajar con los datos en otras aplicaciones.
- Use la exportación a PDF cuando necesite imprimir o compartir documentos formales.

### Navegación

- Use el menú lateral para navegar entre secciones.
- Haga clic en los enlaces del Dashboard para acceso rápido a información filtrada.
- Use el botón "Salir" para cerrar sesión de forma segura.

### Gestión de Mantenimientos

- Programe mantenimientos preventivos con anticipación.
- Complete los mantenimientos tan pronto como estén finalizados para mantener el historial actualizado.
- Use el motivo de baja cuando un equipo no pueda ser reparado.

---

## Solución de Problemas

### No puedo iniciar sesión

1. Verifique que su nombre de usuario y contraseña sean correctos.
2. Verifique que las mayúsculas/minúsculas estén correctas.
3. Contacte al administrador del sistema si el problema persiste.

### Los datos no se actualizan

1. Recargue la página (F5 o Ctrl+R).
2. Verifique su conexión a internet.
3. Si el problema persiste, cierre sesión y vuelva a iniciar sesión.

### No puedo ver ciertas secciones

1. Verifique que su rol de usuario tenga los permisos necesarios.
2. Contacte al administrador para solicitar los permisos adecuados.

### Error al guardar datos

1. Verifique que todos los campos obligatorios estén completos (marcados con *).
2. Revise que los datos ingresados sean válidos (fechas, números, etc.).
3. Si el error persiste, contacte al soporte técnico.

---

## Soporte

Para soporte técnico o consultas sobre el uso del sistema, contacte al administrador del sistema o al equipo de TI de su organización.

---

**Versión del Manual**: 1.0  
**Fecha de última actualización**: 2024


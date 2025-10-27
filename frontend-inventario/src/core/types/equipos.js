/**
 * @typedef {'PC'|'NOTEBOOK'|'SERVIDOR'} EquipoTipo
 * @typedef {'ACTIVO'|'REPARACION'|'BAJA'} EquipoEstado
 */

/** @typedef {{ id: string, nombre: string }} Area */
/** @typedef {{ id: string, razonSocial: string }} Proveedor */
/** @typedef {{ id: string, nombre: string, apellido: string }} Empleado */

/**
 * @typedef {Object} Equipo
 * @property {string} id
 * @property {string} codigoInterno
 * @property {EquipoTipo} tipo
 * @property {string=} fechaCompra     // YYYY-MM-DD
 * @property {string=} garantia        // YYYY-MM-DD (fin)
 * @property {EquipoEstado} estado
 * @property {Area=} area
 * @property {Proveedor=} proveedor
 * @property {Empleado=} empleadoAsignado
 */

/**
 * @typedef {Object} EquipoListQuery
 * @property {number=} page
 * @property {number=} limit
 * @property {string=} search
 * @property {EquipoTipo=} tipo
 * @property {EquipoEstado=} estado
 * @property {string=} areaId
 * @property {string=} proveedorId
 * @property {string=} empleadoAsignadoId
 * @property {string=} garantiaAntesDe   // YYYY-MM-DD
 */

export {};

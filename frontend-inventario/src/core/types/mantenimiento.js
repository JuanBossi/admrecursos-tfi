/**
 * @typedef {'Preventivo'|'Correctivo'} MantenimientoTipo
 * @typedef {'PROGRAMADO'|'EN PROGRESO'|'COMPLETO'|'CANCELADO'} MantenimientoEstado
 */

/**
 * @typedef {Object} Mantenimiento
 * @property {string} id
 * @property {string} equipoId
 * @property {MantenimientoTipo} tipo
 * @property {MantenimientoEstado} estado
 * @property {string=} fechaProgramada   // ISO
 */

export {};

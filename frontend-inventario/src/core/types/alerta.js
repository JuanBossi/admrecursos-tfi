/**
 * @typedef {Object} GarantiasBucket
 * @property {number} total
 * @property {any[]} items
 */

/**
 * @typedef {Object} GarantiasResponse
 * @property {number} total
 * @property {{ desde: string, hasta: string }} rango
 * @property {GarantiasBucket} vencidas
 * @property {GarantiasBucket} proximas
 */

export {};

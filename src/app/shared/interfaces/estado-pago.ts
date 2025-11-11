// src/app/entities/estado-pago.ts

/** 
 * Enumeración que representa el estado de un pago.
 * Equivalente al enum EstadoPago de Java.
 */
export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  FALLIDO = 'FALLIDO',
  CANCELADO = 'CANCELADO',
  DEVUELTO = 'DEVUELTO'
}

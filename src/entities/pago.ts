// src/app/entities/pago.ts

import { MetodoPago } from './metodo-pago';
import { EstadoPago } from './estado-pago';
import { Reserva } from './reserva';

/**
 * Representa un pago realizado por un cliente.
 * Equivalente a la entidad Java: viagest.entidades.Pago
 */
export interface Pago {
  /** Identificador único del pago (autogenerado en backend) */
  idPago: number;

  /** Monto total del pago */
  monto: number;

  /** Método de pago utilizado */
  metodoPago: MetodoPago;

  /** Fecha en que se realizó el pago */
  fechaPago: Date | string;

  /** Estado actual del pago */
  estadoPago: EstadoPago;

  /** Referencia o código del pago (ej: número de transacción) */
  referencia: string;

  /** Reserva asociada (relación muchos a uno con Reserva) */
  reserva: Reserva;
}

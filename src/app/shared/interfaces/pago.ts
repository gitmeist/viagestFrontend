
import { MetodoPago } from './metodo-pago';
import { EstadoPago } from './estado-pago';
import { Reserva } from './reserva';

export interface Pago {
  /** Identificador único del pago */
  idPago: number;

  /** Monto total del pago */
  monto: number;

  /** Método de pago utilizado */
  metodoPago: MetodoPago;

  /** Fecha en que se realizó el pago */
  fechaPago: Date | string;

  /** Estado actual del pago */
  estadoPago: EstadoPago;

  /** Reserva asociada*/
  reserva: Reserva;
}

// src/app/entities/factura.ts

import { Pago } from "./pago";

/**
 * Representa una factura emitida por el sistema.
 * Equivalente a la entidad Java: viagest.entidades.Factura
 */
export interface Factura {
  /** Identificador único de la factura (auto-generado en backend) */
  idFactura: number;

  /** Número de factura visible para el cliente */
  numeroFactura: string;

  /** Fecha de emisión de la factura */
  fechaEmision: Date | string;

  /** Subtotal antes de impuestos */
  subtotal: number;

  /** Importe de impuestos aplicados */
  impuestos: number;

  /** Total final de la factura */
  total: number;

  /** Detalles o notas adicionales (texto largo) */
  detalles: string;

  /** Pago asociado (relación uno a uno con Pago) */
  pago: Pago;
}

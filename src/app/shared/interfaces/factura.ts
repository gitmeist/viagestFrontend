
import { Pago } from "./pago";

export interface Factura {
  /** Identificador único de la factura  */
  idFactura: number;

  /** Número de factura visible  */
  numeroFactura: string;

  /** Fecha de emisión de la factura */
  fechaEmision: Date | string;

  /** Subtotal antes de impuestos */
  subtotal: number;

  /** Importe de impuestos aplicados */
  impuestos: number;

  /** Total final de la factura */
  total: number;

  /** Detalles o notas adicionales */
  detalles: string;

  /** Pago asociado */
  pago: Pago;
}

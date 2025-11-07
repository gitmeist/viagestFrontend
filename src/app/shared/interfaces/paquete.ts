// src/app/entities/paquete.ts

/**
 * Representa un paquete de viaje ofrecido por el sistema.
 * Equivalente a la entidad Java: viagest.entidades.Paquete
 */
export interface Paquete {
  /** Identificador único del paquete (autogenerado en backend) */
  idPaquete: number;

  /** Nombre del paquete */
  nombre: string;

  /** Destino principal del paquete */
  destino: string;

  /** Descripción detallada del paquete */
  descripcion: string;

  /** Precio del paquete */
  precio: number;

  /** Duración en días */
  duracionDias: number;

  /** Indica si incluye vuelo */
  incluyeVuelo: boolean;

  /** Indica si incluye hotel */
  incluyeHotel: boolean;

  /** Estado activo/inactivo del paquete */
  activo: boolean;
}

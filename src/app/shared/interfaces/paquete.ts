export interface Paquete {
  /** Identificador único del paquete */
  idPaquete: number;

  /** Nombre del paquete */
  nombre: string;

  /** Destino principal del paquete */
  destino: string;

  /** Descripción detallada del paquete */
  descripcion: string;

  /** Precio del paquete */
  precio: number;

  /** Nombre de archivo de la imagen  */
  imagen?: string;

  /** Duración en días */
  duracionDias: number;

  /** Indica si incluye vuelo */
  incluyeVuelo: boolean;

  /** Indica si incluye hotel */
  incluyeHotel: boolean;

  /** Estado activo/inactivo del paquete */
  activo: boolean;
}

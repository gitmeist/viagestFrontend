// src/app/entities/reserva.ts

import { EstadoReserva } from './estado-reserva';
import { Cliente } from './cliente';
import { Paquete } from './paquete';
import { Usuario } from './usuario';

/**
 * Representa una reserva realizada por un cliente.
 * Equivalente a la entidad Java: viagest.entidades.Reserva
 */
export interface Reserva {
  /** Identificador único de la reserva (autogenerado en backend) */
  idReserva: number;

  /** Fecha en que se realizó la reserva */
  fechaReserva: Date | string;

  /** Fecha programada del viaje */
  fechaViaje: Date | string;

  /** Número de personas incluidas en la reserva */
  numPersonas: number;

  /** Estado actual de la reserva */
  estadoReserva: EstadoReserva;

  /** Observaciones adicionales */
  observaciones: string;

  /** Cliente que realiza la reserva */
  cliente: Cliente;

  /** Paquete asociado a la reserva */
  paquete: Paquete;

  /** Usuario que gestiona la reserva */
  usuario: Usuario;
}

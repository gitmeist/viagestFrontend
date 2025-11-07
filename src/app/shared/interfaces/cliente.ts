// src/app/entities/cliente.ts

export interface Cliente {
  /** Identificador único del cliente (equivale a @Id en JPA) */
  cif: string;

  /** Nombre completo del cliente */
  nombre: string;

  /** Correo electrónico */
  email: string;

  /** Número de teléfono */
  telefono: string;

  /** Dirección o domicilio */
  domicilio: string;

  /** Fecha de nacimiento (Date o string ISO) */
  fechaNacimiento: Date | string;

  /** Fecha de registro en el sistema */
  fechaRegistro: Date | string;
}
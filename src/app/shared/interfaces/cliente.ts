// src/app/entities/cliente.ts

export interface Cliente {
  /** Identificador único del cliente*/
  cif: string;

  /** Nombre completo del cliente */
  nombre: string;

  /** Correo electrónico */
  email: string;

  /** Número de teléfono */
  telefono: string;

  /** Dirección o domicilio */
  domicilio: string;

  /** Fecha de nacimiento  */
  fechaNacimiento: Date | string;

  /** Fecha de registro  */
  fechaRegistro: Date | string;
}
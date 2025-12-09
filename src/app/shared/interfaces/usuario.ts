export interface Usuario {
  username: string;
  email: string;
  rol: string;
  password: string;

  nombre?: string;
  apellidos?: string;
  direccion?: string;
  enabled?: number;
  fechaRegistro?: string;
}
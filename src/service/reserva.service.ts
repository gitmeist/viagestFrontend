import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../entities/reserva';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root' // Singleton global
})
export class ReservaService {

  private readonly baseUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) { }

  /** Crear nueva reserva */
  alta(reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.baseUrl, reserva);
  }

  /** Modificar reserva existente */
  modificar(id: number, reserva: Reserva): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.baseUrl}/${id}`, reserva);
  }

  /** Eliminar reserva por ID */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Buscar reserva por ID */
  buscarUna(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.baseUrl}/${id}`);
  }

  /** Listar todas las reservas */
  buscarTodas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.baseUrl);
  }

  /** Listar reservas por cliente (CIF) */
  buscarPorCliente(cif: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/cliente/${cif}`);
  }

  /** Listar reservas por usuario (username) */
  buscarPorUsuario(username: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/usuario/${username}`);
  }

  /** Listar reservas por paquete (idPaquete) */
  buscarPorPaquete(idPaquete: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/paquete/${idPaquete}`);
  }
}

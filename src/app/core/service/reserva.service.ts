import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reserva } from '../../shared/interfaces/reserva';

@Injectable({
  providedIn: 'root' 
})
export class ReservaService {

  private readonly baseUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) { }

  /** Crear nueva reserva */
  alta(reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.baseUrl, reserva, { withCredentials: true });
  }

  /** Modificar reserva existente */
  modificar(id: number, reserva: Reserva): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.baseUrl}/${id}`, reserva, { withCredentials: true });
  }

  /** Cancelar reserva */
  cancelar(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.baseUrl}/${id}/cancelar`, {}, { withCredentials: true });
  }

  /** Eliminar reserva por ID */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  /** Buscar reserva por ID */
  buscarUna(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  /** Listar todas las reservas */
  buscarTodas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.baseUrl, { withCredentials: true });
  }

  /** Listar reservas por cliente (CIF) */
  buscarPorCliente(cif: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/cliente/${cif}`, { withCredentials: true });
  }

  /** Listar reservas por usuario (username) */
  buscarPorUsuario(username: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/usuario/${username}`, { withCredentials: true });
  }

  /** Listar reservas por paquete (idPaquete) */
  buscarPorPaquete(idPaquete: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/paquete/${idPaquete}`, { withCredentials: true });
  }
}

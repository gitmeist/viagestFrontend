import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pago } from '../../shared/interfaces/pago';

@Injectable({
  providedIn: 'root' // Singleton global
})
export class PagoService {

  private readonly baseUrl = `${environment.apiUrl}/pagos`;

  constructor(private http: HttpClient) { }

  /** Crear nuevo pago */
  alta(pago: Pago): Observable<Pago> {
    return this.http.post<Pago>(this.baseUrl, pago, { withCredentials: true });
  }

  /** Modificar pago existente */
  modificar(id: number, pago: Pago): Observable<Pago> {
    return this.http.put<Pago>(`${this.baseUrl}/${id}`, pago, { withCredentials: true });
  }

  /** Eliminar pago por ID */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  /** Buscar pago por ID */
  buscarUno(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  /** Listar todos los pagos */
  buscarTodos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.baseUrl, { withCredentials: true });
  }

  /** Buscar pagos por reserva */
  buscarPorReserva(idReserva: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.baseUrl}/reserva/${idReserva}`, { withCredentials: true });
  }
}

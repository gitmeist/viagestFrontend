import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pago } from '../../shared/interfaces/pago';

@Injectable({
  providedIn: 'root' 
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

  /** Buscar pagos generados en el último mes */
  pagosUltimoMes(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.baseUrl}/ultimo-mes`, { withCredentials: true });
  }

  /** Cancelar un pago */
  cancelarPago(idPago: number): Observable<Pago> {
    return this.http.patch<Pago>(`${this.baseUrl}/${idPago}/cancelar-pago`, {}, { withCredentials: true });
  }

  aceptarPago(idPago: number): Observable<Pago> {
    return this.http.patch<Pago>(`${this.baseUrl}/${idPago}/aceptar-pago`, {}, { withCredentials: true });
  }
}

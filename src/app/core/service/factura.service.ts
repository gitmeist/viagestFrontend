import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Factura } from '../../shared/interfaces/factura';

@Injectable({
  providedIn: 'root' 
})
export class FacturaService {

  private readonly baseUrl = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) { }

  /** Crear nueva factura */
  alta(factura: Factura): Observable<Factura> {
    return this.http.post<Factura>(this.baseUrl, factura, { withCredentials: true });
  }

  /** Modificar factura existente */
  modificar(factura: Factura): Observable<Factura> {
    return this.http.put<Factura>(this.baseUrl, factura, { withCredentials: true });
  }

  /** Eliminar factura por ID */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  /** Buscar factura por ID */
  buscarUna(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  /** Listar todas las facturas */
  buscarTodas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.baseUrl, { withCredentials: true });
  }

  /** Buscar factura asociada a un pago */
  buscarPorPago(idPago: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.baseUrl}/pago/${idPago}`, { withCredentials: true });
  }
}

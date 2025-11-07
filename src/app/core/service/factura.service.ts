import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Factura } from '../../shared/interfaces/factura';

@Injectable({
  providedIn: 'root' // Singleton global
})
export class FacturaService {

  private readonly baseUrl = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) { }

  /** Crear nueva factura */
  alta(factura: Factura): Observable<Factura> {
    return this.http.post<Factura>(this.baseUrl, factura);
  }

  /** Modificar factura existente */
  modificar(factura: Factura): Observable<Factura> {
    return this.http.put<Factura>(this.baseUrl, factura);
  }

  /** Eliminar factura por ID */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Buscar factura por ID */
  buscarUna(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.baseUrl}/${id}`);
  }

  /** Listar todas las facturas */
  buscarTodas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.baseUrl);
  }

  /** Buscar factura asociada a un pago */
  buscarPorPago(idPago: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.baseUrl}/pago/${idPago}`);
  }
}

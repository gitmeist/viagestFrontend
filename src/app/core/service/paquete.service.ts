import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paquete } from '../../shared/interfaces/paquete';

@Injectable({
  providedIn: 'root' // Singleton global
})
export class PaqueteService {

  private readonly baseUrl = `${environment.apiUrl}/paquetes`;

  constructor(private http: HttpClient) { }

  /** Crear nuevo paquete */
  alta(paquete: Paquete): Observable<Paquete> {
    return this.http.post<Paquete>(this.baseUrl, paquete);
  }

  /** Modificar paquete existente */
  modificar(id: number, paquete: Paquete): Observable<Paquete> {
    return this.http.put<Paquete>(`${this.baseUrl}/${id}`, paquete);
  }

  /** Eliminar paquete por ID */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Buscar paquete por ID */
  buscarUno(id: number): Observable<Paquete> {
    return this.http.get<Paquete>(`${this.baseUrl}/${id}`);
  }

  /** Listar todos los paquetes */
  buscarTodos(): Observable<Paquete[]> {
    return this.http.get<Paquete[]>(this.baseUrl);
  }

  /** Listar solo paquetes activos */
  buscarActivos(): Observable<Paquete[]> {
    return this.http.get<Paquete[]>(`${this.baseUrl}/activos`);
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaqueteActividad } from '../../shared/interfaces/paqueteActividad';

@Injectable({
  providedIn: 'root'
})
export class PaqueteActividadService {

  private readonly baseUrl = `${environment.apiUrl}/paqueteactividades`;

  constructor(private http: HttpClient) {}

  /** Traer todas las actividades de un paquete */
  actividadesPorPaquete(idPaquete: number): Observable<PaqueteActividad[]> {
    return this.http.get<PaqueteActividad[]>(`${this.baseUrl}/paquete/${idPaquete}`, { withCredentials: true });
  }

  /** Crear actividad */
  crear(actividad: PaqueteActividad, idPaquete: number): Observable<PaqueteActividad> {
    return this.http.post<PaqueteActividad>(`${this.baseUrl}/paquete/${idPaquete}`, actividad, { withCredentials: true });
  }

  /** Actualizar actividad */
  actualizar(id: number, actividad: PaqueteActividad): Observable<PaqueteActividad> {
    return this.http.put<PaqueteActividad>(`${this.baseUrl}/${id}`, actividad, { withCredentials: true });
  }

  /** Eliminar actividad */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
}

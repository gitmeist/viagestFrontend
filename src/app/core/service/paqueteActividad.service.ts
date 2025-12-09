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
}

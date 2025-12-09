import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActividadImagen } from '../../shared/interfaces/actividadImagen';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActividadImagenService {
private apiUrl = 'http://localhost:8080/api/actividadimagenes/actividad';

  constructor(private http: HttpClient) {}

  getPorActividad(idActividad: number): Observable<ActividadImagen[]> {
    return this.http.get<ActividadImagen[]>(`${this.apiUrl}/actividad/${idActividad}`, { withCredentials: true });
  }
}

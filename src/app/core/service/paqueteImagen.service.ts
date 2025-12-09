import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaqueteImagen } from '../../shared/interfaces/paqueteImagen';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaqueteImagenService {
 private apiUrl = 'http://localhost:8080/api/paqueteimagenes/paquete';

  constructor(private http: HttpClient) {}

  getPorPaquete(idPaquete: number): Observable<PaqueteImagen[]> {
    return this.http.get<PaqueteImagen[]>(`${this.apiUrl}/${idPaquete}`);
  }
}

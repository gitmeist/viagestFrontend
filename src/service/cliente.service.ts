import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../entities/cliente';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root' // Singleton global
})
export class ClienteService {

  private readonly baseUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) { }

  /** Crear nuevo cliente */
  alta(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/alta`, cliente);
  }

  /** Modificar cliente existente */
  modificar(cif: string, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${cif}`, cliente);
  }

  /** Eliminar cliente por CIF */
  eliminar(cif: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${cif}`);
  }

  /** Buscar cliente por CIF */
  buscarUno(cif: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${cif}`);
  }

  /** Listar todos los clientes */
  buscarTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl);
  }
}

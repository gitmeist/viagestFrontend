import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../shared/interfaces/usuario';

@Injectable({
  providedIn: 'root' 
})
export class UsuarioService {

  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) { }

  /** Listar todos los usuarios */
  listarTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl, { withCredentials: true });;
  }

  /** Obtener usuario por username */
  buscarPorUsername(username: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${username}`, { withCredentials: true });;
  }

  /** Crear nuevo usuario */
  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario, { withCredentials: true });;
  }

  /** Actualizar usuario */
  actualizar(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(this.baseUrl, usuario, { withCredentials: true });;
  }

  /** Eliminar usuario por username */
  eliminar(username: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${username}`, { withCredentials: true });;
  }

  /** Listar usuarios por rol */
  buscarPorRol(rol: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/rol/${rol}`, { withCredentials: true });;
  }
}

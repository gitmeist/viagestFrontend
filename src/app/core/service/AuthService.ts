import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://localhost:9009/api'; // URL del backend
  private readonly USER_KEY = 'user';
  private http = inject(HttpClient)

  constructor() {}

  /**
   * Realiza el login usando autenticación HTTP Basic a través de un POST a /api/login.
   * La respuesta de la llamada contiene los datos del usuario.
   */
  login(username: string, password: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(username + ':' + password)
    });

    // Llamada POST a /api/login con cabecera de autorización
    return this.http.post(`${this.baseUrl}/login`, null, { headers, withCredentials: true })
      .pipe(
        // Guardar el usuario en localStorage
        tap((user: any) => {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        })
      );
  }

  /** Devuelve los datos del usuario logueado o null si no hay */
  getUser() {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /** Devuelve el rol del usuario logueado o null si no hay */
  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }

  /** Indica si hay un usuario autenticado */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.USER_KEY);
  }

  /** Cierra sesión y elimina los datos del usuario */
  logout() {
  return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
    .pipe(
      tap(() => {
        localStorage.removeItem(this.USER_KEY);
      })
    );
  }

}
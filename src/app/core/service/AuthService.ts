import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://localhost:9009/api'; // URL del backend
  private readonly USER_KEY = 'user';
  private http = inject(HttpClient)

  constructor() {}

  /**
   * Realiza login enviando username y password al backend.
   * Solo guarda los datos del usuario si la respuesta es exitosa.
   */
  login(username: string, password: string) {
    return this.http.post(`${this.baseUrl}/login`, { username, password }, { withCredentials: true })
      .pipe(
        // Guardar usuario en localStorage si login correcto
        tap((res: any) => {
          if (res.status === 'success') {
            localStorage.setItem(this.USER_KEY, JSON.stringify({ username: res.username }));
          }
      })    
      );
  }

  /** Devuelve los datos del usuario logueado o null si no hay */
  getUser() {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
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
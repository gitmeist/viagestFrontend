import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://localhost:9009'; // URL de tu backend

  constructor(private http: HttpClient) { }

  // Método para hacer login
  login(username: string, password: string) {
    // Hace un POST a /login enviando credenciales
    return this.http.post(
      `${this.baseUrl}/login`, 
      { username, password }, 
      { withCredentials: true } // Esto permite que Angular envíe cookies de sesión
    );
  }
}

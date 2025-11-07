import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/service/AuthService';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router // <-- necesario para redirigir
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
      console.log('Formulario enviado', this.loginForm.value); // 👈 esto debería aparecer
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (res: any) => {
          console.log('Login exitoso', res);
          if (res.status === 'success') {
            this.router.navigate([res.redirectUrl || '/home']);
          } else {
            alert('Credenciales incorrectas');
          }
        },
        error: (err) => {
          console.error('Error de login', err);
          alert('Error al iniciar sesión');
        }
      });
    }
  }
}
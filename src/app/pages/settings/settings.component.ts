import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../shared/interfaces/usuario';
import { UsuarioService } from '../../core/service/usuario.service';
import { AuthService } from '../../core/service/AuthService';

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  usuarioForm!: FormGroup;
  usuarioActual!: Usuario;
  usuarios: Usuario[] = [];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const loggedUser = this.authService.getUser();
    if (loggedUser) {
      this.usuarioService.buscarPorUsername(loggedUser.username).subscribe(u => {
        this.usuarioActual = u;
        this.initForm(u);
      });
    }

    this.cargarUsuarios();
  }

  initForm(usuario: Usuario) {
    this.usuarioForm = this.fb.group({
      nombre: [usuario.nombre || ''],
      email: [{ value: usuario.email, disabled: true }],
      rol: [usuario.rol],
      enabled: [usuario.enabled === 1]
    });
  }

  cargarUsuarios() {
    this.usuarioService.listarTodos().subscribe(data => {
      this.usuarios = data;
    });
  }

  guardarCambios() {
    const updatedUser: Usuario = {
      ...this.usuarioActual,
      ...this.usuarioForm.getRawValue(),
      enabled: this.usuarioForm.value.enabled ? 1 : 0
    };

    this.usuarioService.actualizar(updatedUser).subscribe(() => {
      alert('Cambios guardados correctamente');
      this.cargarUsuarios();
    });
  }

  eliminarUsuario(username: string) {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.usuarioService.eliminar(username).subscribe(() => {
        this.cargarUsuarios();
      });
    }
  }
}


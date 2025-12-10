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
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  usuarioForm!: FormGroup;         // Formulario del usuario actual (solo para Personal Info Card)
  nuevoUsuarioForm!: FormGroup;    // Formulario para crear nuevo usuario
  editarUsuarioForm!: FormGroup;   // Formulario para editar usuario de la tabla
  usuarioActual!: Usuario;
  usuarios: Usuario[] = [];
  isEditingUser = false;           // solo para editar usuario desde Personal Info Card
  mostrarModalCrear = false;
  mostrarModalEditar = false;      // Modal para editar usuario de la tabla
  usuarioAEditar: Usuario | null = null;


  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Inicializamos formulario del usuario actual
    this.usuarioForm = this.fb.group({
      nombre: [''],
      email: [{ value: '', disabled: true }],
      rol: [''],
      enabled: [false],
      newPassword: [''],
      confirmPassword: ['']
    });

    // Inicializamos formulario para crear nuevo usuario
    this.nuevoUsuarioForm = this.fb.group({
      nombre: [''],
      username: [''],
      apellidos: [''],
      email: [''],
      password: [''],
      direccion: [''],
      rol: ['EMPLEADO'],
      enabled: [true]
    });

    // Inicializamos formulario para editar usuario de la tabla
    this.editarUsuarioForm = this.fb.group({
      nombre: [''],
      username: [{ value: '', disabled: true }], // Username no se puede editar
      apellidos: [''],
      email: [''],
      direccion: [''],
      rol: [''],
      enabled: [true]
    });

    // Cargar usuario logueado
    const loggedUser = this.authService.getUser();
    if (loggedUser) {
      this.usuarioService.buscarPorUsername(loggedUser.username)
        .subscribe((u: Usuario) => {
          this.usuarioActual = u;
          this.initForm(u);
        });
    }
    // Cargar todos los usuarios SOLO si el usuario es administrador
    // (se hará después de obtener usuarioActual)
    if (loggedUser) {
      this.usuarioService.buscarPorUsername(loggedUser.username)
        .subscribe((u: Usuario) => {
          this.usuarioActual = u;
          this.initForm(u);
          if (u && u.rol === 'ADMON') {
            this.cargarUsuarios();
          } else {
            this.usuarios = [];
          }
        });
    }
  }

  /** Inicializa el formulario con los datos de un usuario */
  initForm(usuario: Usuario) {
    this.usuarioForm = this.fb.group({
      nombre: [usuario.nombre || ''],
      apellidos: [usuario.apellidos || ''],
      email: [{ value: usuario.email, disabled: true }],
      rol: [usuario.rol],
      enabled: [usuario.enabled === 1],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  /** Carga todos los usuarios desde el backend */
  cargarUsuarios() {
    this.usuarioService.listarTodos().subscribe((data: Usuario[]) => {
      this.usuarios = data;
    });
  }

  /** Guarda cambios del usuario actual (solo desde Personal Info Card) */
  guardarCambios() {
    const { newPassword, confirmPassword } = this.usuarioForm.getRawValue();
    if ((newPassword || confirmPassword) && newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    // Validación básica de longitud
    if (newPassword && newPassword.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    const updatedUser: Usuario = {
      ...this.usuarioActual,
      ...this.usuarioForm.getRawValue(),
      enabled: this.usuarioForm.value.enabled ? 1 : 0
    };

    // Si hay nueva contraseña válida, incluirla en el payload
    if (newPassword && newPassword === confirmPassword) {
      (updatedUser as any).password = newPassword;
    }

    this.usuarioService.actualizar(updatedUser).subscribe({
      next: (usuarioActualizado: Usuario) => {
        alert('Cambios guardados correctamente');
        this.usuarioActual = usuarioActualizado; // actualizar datos locales
        this.isEditingUser = false;
        // Limpiar campos de contraseña del formulario
        this.usuarioForm.patchValue({ newPassword: '', confirmPassword: '' });
        // Recargar usuario actual y lista de usuarios
        const loggedUser = this.authService.getUser();
        if (loggedUser) {
          this.usuarioService.buscarPorUsername(loggedUser.username)
            .subscribe((u: Usuario) => {
              this.usuarioActual = u;
              this.initForm(u);
            });
        }
        if (this.usuarioActual.rol === 'ADMON') {
          this.cargarUsuarios();
        }
      },
      error: (err: any) => {
        alert('Error al guardar los cambios: ' + (err.message || 'Error desconocido'));
      }
    });
  }


  /** Elimina un usuario por username */
  eliminarUsuario(username: string) {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.usuarioService.eliminar(username).subscribe(() => {
        this.cargarUsuarios();
      });
    }
  }

  /** Actualiza el rol de un usuario */
  actualizarRol(u: Usuario, nuevoRol: string) {
    const actualizado = { ...u, rol: nuevoRol };
    this.usuarioService.actualizar(actualizado).subscribe(() => {
      this.cargarUsuarios();
    });
  }

  /** Abre el modal para editar un usuario de la tabla */
  editarUsuario(u: Usuario) {
    this.usuarioAEditar = { ...u };
    this.editarUsuarioForm.patchValue({
      nombre: u.nombre || '',
      username: u.username,
      apellidos: u.apellidos || '',
      email: u.email || '',
      direccion: u.direccion || '',
      rol: u.rol || 'EMPLEADO',
      enabled: u.enabled === 1
    });
    this.mostrarModalEditar = true;
  }

  /** Guarda los cambios del usuario editado desde la tabla */
  guardarUsuarioEditado() {
    if (!this.usuarioAEditar || this.editarUsuarioForm.invalid) return;

    const updatedUser: Usuario = {
      ...this.usuarioAEditar,
      ...this.editarUsuarioForm.getRawValue(),
      username: this.usuarioAEditar.username, // Mantener el username original
      enabled: this.editarUsuarioForm.value.enabled ? 1 : 0
    };

    this.usuarioService.actualizar(updatedUser).subscribe({
      next: () => {
        alert('Usuario actualizado correctamente');
        this.mostrarModalEditar = false;
        this.usuarioAEditar = null;
        this.cargarUsuarios();
      },
      error: (err: any) => {
        alert('Error al actualizar el usuario: ' + (err.message || 'Error desconocido'));
      }
    });
  }

  /** Cierra el modal de editar usuario */
  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.usuarioAEditar = null;
    this.editarUsuarioForm.reset();
  }


  /** Crear un nuevo usuario desde el modal */
  crearUsuario() {
    if (this.nuevoUsuarioForm.invalid) return;

    // Obtener fecha actual en formato yyyy-MM-dd
    const fechaActual = new Date().toISOString().split('T')[0];

    const payload: Usuario = {
      ...this.nuevoUsuarioForm.value,
      enabled: this.nuevoUsuarioForm.value.enabled ? 1 : 0,
      fechaRegistro: fechaActual // Añadir fecha de registro automáticamente
    };

    this.usuarioService.crear(payload).subscribe({
      next: () => {
        alert('Usuario creado correctamente');
        this.cargarUsuarios();
        // Reset formulario
        this.nuevoUsuarioForm.reset({
          rol: 'EMPLEADO',
          enabled: true,
          direccion: ''
        });
        this.mostrarModalCrear = false; // cerrar modal
      },
      error: (err: any) => {
        alert('Error al crear el usuario: ' + (err.message || 'Error desconocido'));
      }
    });
  }


}

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../core/service/cliente.service';
import { Cliente } from '../../shared/interfaces/cliente';
import { Paquete } from '../../shared/interfaces/paquete';
import { PaqueteService } from '../../core/service/paquete.service';
import { ReservaService } from '../../core/service/reserva.service';
import { PagoService } from '../../core/service/pago.service';
import { AuthService } from '../../core/service/AuthService';
import { Reserva } from '../../shared/interfaces/reserva';
import { Pago } from '../../shared/interfaces/pago';
import { EstadoReserva } from '../../shared/interfaces/estado-reserva';
import { MetodoPago } from '../../shared/interfaces/metodo-pago';
import { EstadoPago } from '../../shared/interfaces/estado-pago';

@Component({
  standalone: true,
  selector: 'app-cliente',
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  totalFiltrados: number = 0;
  fechaRegistroFiltro: string = '';

  Math = Math;
  busqueda = '';
  paginaActual = 1;
  clientesPorPagina = 10;

  mostrarModalReserva = false;
  paquetes: Paquete[] = [];

  clienteParaReserva: Cliente | null = null;
  paqueteSeleccionado: Paquete | null = null;

  // Datos de reserva
  fechaReserva: string = '';
  fechaViaje: string = '';
  numeroPersonas: number = 1;
  observaciones: string = '';
  estadoReserva: string = 'PENDIENTE';

  // Datos de pago
  cantidadPago: number = 0;
  metodoPago: string = '';
  fechaMinima: string = '';

  //  modal de cliente
  mostrarModalCliente = false;

  nuevoClienteData: Cliente = {
    cif: '',
    nombre: '',
    email: '',
    telefono: '',
    domicilio: '',
    fechaNacimiento: '',
    fechaRegistro: ''
  };

  // Modal editar cliente
  mostrarModalEditar = false;
  clienteEditar: Cliente = {
    cif: '',
    nombre: '',
    email: '',
    telefono: '',
    domicilio: '',
    fechaNacimiento: '',
    fechaRegistro: ''
  };

  constructor(
    private clienteService: ClienteService,
    private paqueteService: PaqueteService,
    private reservaService: ReservaService,
    private pagoService: PagoService,
    private authService: AuthService
  ) { }


  ngOnInit(): void {
    this.cargarClientes();
    this.clienteService.buscarTodos().subscribe(data => this.clientes = data || []);
    this.paqueteService.buscarTodos().subscribe(data => this.paquetes = data || []);
    this.fechaMinima = this.obtenerFechaLocal();
  }

  abrirModalReserva(cliente: Cliente) {
    this.clienteParaReserva = cliente;
    this.mostrarModalReserva = true;
    this.fechaReserva = this.obtenerFechaLocal();
    this.estadoReserva = 'PENDIENTE';
  }

  cerrarModalReserva() {
    this.mostrarModalReserva = false;
    this.clienteParaReserva = null;
    this.paqueteSeleccionado = null;
    this.fechaReserva = '';
    this.fechaViaje = '';
    this.numeroPersonas = 1;
    this.observaciones = '';
    this.estadoReserva = 'PENDIENTE';
    this.cantidadPago = 0;
    this.metodoPago = '';
  }

  guardarReserva() {
    // Validaciones
    if (!this.clienteParaReserva || !this.paqueteSeleccionado) {
      alert('Debe seleccionar un cliente y un paquete');
      return;
    }
    if (!this.fechaReserva || !this.fechaViaje || !this.numeroPersonas) {
      alert('Debe completar todos los campos obligatorios');
      return;
    }
    if (!this.cantidadPago || !this.metodoPago) {
      alert('Debe ingresar el monto y método de pago');
      return;
    }

    const user = this.authService.getUser();
    if (!user || !user.username) {
      alert('No se pudo obtener el usuario autenticado');
      return;
    }

    // Crear reserva
    const nuevaReserva: any = {
      fechaReserva: new Date(this.fechaReserva),
      fechaViaje: new Date(this.fechaViaje),
      numPersonas: this.numeroPersonas,
      estadoReserva: this.estadoReserva as EstadoReserva,
      observaciones: this.observaciones || '',
      cliente: this.clienteParaReserva,
      paquete: this.paqueteSeleccionado,
      usuario: { username: user.username }
    };

    this.reservaService.alta(nuevaReserva).subscribe({
      next: (reservaCreada) => {
        console.log('Reserva creada:', reservaCreada);

        // Crear pago asociado a la reserva
        const nuevoPago: any = {
          monto: this.cantidadPago,
          metodoPago: this.convertirMetodoPago(this.metodoPago),
          fechaPago: new Date(),
          estadoPago: EstadoPago.COMPLETADO,
          referencia: `PAG-${Date.now()}`,
          reserva: reservaCreada
        };

        this.pagoService.alta(nuevoPago).subscribe({
          next: (pagoCreado) => {
            console.log('Pago creado:', pagoCreado);
            this.cerrarModalReserva();
            alert('Reserva y pago registrados correctamente');
          },
          error: (err) => {
            console.error('Error al crear pago:', err);
            alert('Reserva creada pero hubo un error al registrar el pago');
            this.cerrarModalReserva();
          }
        });
      },
      error: (err) => {
        console.error('Error al crear reserva:', err);
        alert('Error al crear la reserva');
      }
    });
  }

  convertirMetodoPago(metodo: string): MetodoPago {
    switch (metodo.toUpperCase()) {
      case 'TARJETA': return MetodoPago.TARJETA;
      case 'TRANSFERENCIA': return MetodoPago.TRANSFERENCIA;
      case 'EFECTIVO': return MetodoPago.EFECTIVO;
      default: return MetodoPago.TARJETA;
    }
  }

  onPaqueteChange() {
    if (this.paqueteSeleccionado) {
      this.cantidadPago = this.paqueteSeleccionado.precio * this.numeroPersonas;
    }
  }

  onFechaViajeChange() {
    if (this.fechaViaje && this.paqueteSeleccionado) {
      const fechaInicio = new Date(this.fechaViaje);
      const fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaFin.getDate() + this.paqueteSeleccionado.duracionDias);
    }
  }


  // Abrir modal cliente
  abrirModalCliente() {
    this.mostrarModalCliente = true;
    this.nuevoClienteData = {
      cif: '',
      nombre: '',
      email: '',
      telefono: '',
      domicilio: '',
      fechaNacimiento: '',
      fechaRegistro: this.obtenerFechaLocal()
    };
  }

  // Cerrar modal
  cerrarModalCliente() {
    this.mostrarModalCliente = false;
    this.nuevoClienteData = {
      cif: '',
      nombre: '',
      email: '',
      telefono: '',
      domicilio: '',
      fechaNacimiento: '',
      fechaRegistro: this.obtenerFechaLocal()
    };
  }

  // Guardar cliente
  guardarCliente() {
    this.nuevoClienteData.fechaRegistro = new Date();

    this.clienteService.alta(this.nuevoClienteData).subscribe({
      next: (clienteGuardado) => {
        console.log('Cliente creado:', clienteGuardado);
        this.clientes.push(clienteGuardado);
        this.aplicarFiltros();
        this.cerrarModalCliente();
        alert('Cliente registrado correctamente.');
      },
      error: (err) => {
        console.error('Error al guardar cliente:', err);
        if (err.status === 409) {
          alert('Ya existe un cliente con ese CIF.');
        } else if (err.status === 500) {
          alert('Error interno del servidor. Inténtalo más tarde.');
        } else {
          alert('Error al guardar el cliente.');
        }
      }
    });
  }

  // Cerrar modal editar
  cerrarModalEditar() {
    this.mostrarModalEditar = false;
  }

  // Guardar cambios
  guardarCambios() {
    const clienteParaActualizar = {
      ...this.clienteEditar,
      fechaNacimiento: new Date(this.clienteEditar.fechaNacimiento),
      fechaRegistro: new Date(this.clienteEditar.fechaRegistro)
    };
    this.clienteService.modificar(this.clienteEditar.cif, clienteParaActualizar).subscribe({
      next: (clienteActualizado) => {
        console.log('Cliente actualizado:', clienteActualizado);
        const index = this.clientes.findIndex(c => c.cif === clienteActualizado.cif);
        if (index !== -1) {
          this.clientes[index] = clienteActualizado;
          this.aplicarFiltros();
        }
        this.cerrarModalEditar();
        alert('Cliente actualizado correctamente.');
      },
      error: (err) => {
        console.error('Error al actualizar cliente:', err);
        alert('Error al actualizar el cliente.');
      }
    });
  }

  obtenerFechaLocal(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }


  cargarClientes(): void {
    this.clienteService.buscarTodos().subscribe({
      next: (data) => {
        this.clientes = data || [];
        this.paginaActual = 1;
        this.aplicarFiltros(false);
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.clientes = [];
        this.clientesFiltrados = [];
      }
    });
  }

  obtenerIniciales(nombreCompleto: string): string {
    if (!nombreCompleto) return '';
    const palabras = nombreCompleto.trim().split(' ');
    const iniciales = palabras.map(p => p[0].toUpperCase()).slice(0, 2).join('');
    return iniciales;
  }


  aplicarFiltros(resetPage: boolean = false): void {
    let filtrados = this.clientes.filter(c => {
      const busquedaLower = this.busqueda.toLowerCase();
      const coincideTexto =
        (c.nombre?.toLowerCase().includes(busquedaLower) || false) ||
        (c.email?.toLowerCase().includes(busquedaLower) || false) ||
        (c.cif?.toLowerCase().includes(busquedaLower) || false);

      const coincideFecha =
        !this.fechaRegistroFiltro ||
        (c.fechaRegistro ? new Date(c.fechaRegistro).toISOString().split('T')[0] === this.fechaRegistroFiltro : false);

      return coincideTexto && coincideFecha;
    });

    this.totalFiltrados = filtrados.length;
    if (resetPage) this.paginaActual = 1;

    const inicio = (this.paginaActual - 1) * this.clientesPorPagina;
    this.clientesFiltrados = filtrados.slice(inicio, inicio + this.clientesPorPagina);
  }

  resetearFiltros() {
    this.busqueda = '';
    this.fechaRegistroFiltro = '';
    this.aplicarFiltros(true);
  }

  cambiarPagina(pagina: number): void {
    const maxPaginas = Math.ceil(this.totalFiltrados / this.clientesPorPagina);
    if (pagina < 1 || pagina > maxPaginas) return;

    this.paginaActual = pagina;
    this.aplicarFiltros(false);
  }

  editar(cliente: Cliente): void {
    this.clienteEditar = {
      ...cliente,
      fechaNacimiento: cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento).toISOString().split('T')[0] : '',
      fechaRegistro: cliente.fechaRegistro ? new Date(cliente.fechaRegistro).toISOString().split('T')[0] : ''
    };
    this.mostrarModalEditar = true;
  }

  reservar(cliente: Cliente): void {
    console.log('Reservar para cliente', cliente);
  }

  nuevoCliente(): void {
    console.log('Nuevo cliente');
  }

}
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../core/service/cliente.service';
import { Cliente } from '../../shared/interfaces/cliente';
import { Paquete } from '../../shared/interfaces/paquete';
import { PaqueteService } from '../../core/service/paquete.service';

@Component({
  selector: 'app-cliente',
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];

  Math = Math;
  busqueda = '';
  filtroFechaRegistro = '';
  filtroEmail = '';
  paginaActual = 1;
  clientesPorPagina = 5;

  mostrarModalReserva = false;
  paquetes: Paquete[] = [];

  clienteParaReserva: Cliente | null = null;
  paqueteSeleccionado: Paquete | null = null;

  // Datos de reserva
  fechaReserva: string = '';
  fechaViaje: string = '';
  numeroPersonas: number = 1;
  observaciones: string = '';

  // Datos de pago
  cantidadPago: number = 0;
  metodoPago: string = '';

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

  constructor(private clienteService: ClienteService,
    private paqueteService: PaqueteService
  ) { }


  ngOnInit(): void {
    this.cargarClientes();
    this.clienteService.buscarTodos().subscribe(data => this.clientes = data || []);
    this.paqueteService.buscarTodos().subscribe(data => this.paquetes = data || []);
  }

  abrirModalReserva(cliente: Cliente) {
    this.clienteParaReserva = cliente;
    this.mostrarModalReserva = true;
  }

  cerrarModalReserva() {
    this.mostrarModalReserva = false;
    this.clienteParaReserva = null;
    this.paqueteSeleccionado = null;
    this.fechaReserva = '';
    this.fechaViaje = '';
    this.numeroPersonas = 1;
    this.observaciones = '';
    this.cantidadPago = 0;
    this.metodoPago = '';
  }

  guardarReserva() {
    console.log('Datos de la reserva:', {
      cliente: this.clienteParaReserva,
      paquete: this.paqueteSeleccionado,
      fechaReserva: this.fechaReserva,
      fechaViaje: this.fechaViaje,
      numeroPersonas: this.numeroPersonas,
      observaciones: this.observaciones,
      cantidadPago: this.cantidadPago,
      metodoPago: this.metodoPago
    });
    this.cerrarModalReserva();
  }


// Abrir modal cliente
abrirModalCliente() {
  this.mostrarModalCliente = true;
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
    fechaRegistro: ''
  };
}

// Guardar cliente
guardarCliente() {
  console.log('Nuevo cliente:', this.nuevoClienteData);
  // llamar al servicio para guardarlo en la base de datos
  this.clientes.push({ ...this.nuevoClienteData });
  this.aplicarFiltros();
  this.cerrarModalCliente();
}


  cargarClientes(): void {
    this.clienteService.buscarTodos().subscribe({
      next: (data) => {
        this.clientes = data || [];
        this.paginaActual = 1;
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.clientes = [];
        this.clientesFiltrados = [];
      }
    });
  }

  aplicarFiltros(): void {
    if (!this.clientes || this.clientes.length === 0) {
      this.clientesFiltrados = [];
      return;
    }

    let filtrados = this.clientes
      .filter(c => {
        if (!c) return false;
        const busquedaLower = this.busqueda.toLowerCase();
        return (
          (c.nombre?.toLowerCase().includes(busquedaLower) || false) ||
          (c.email?.toLowerCase().includes(busquedaLower) || false) ||
          (c.cif?.toLowerCase().includes(busquedaLower) || false)
        );
      })
      .filter(c => {
        if (!this.filtroFechaRegistro) return true;
        if (!c.fechaRegistro) return false;
        try {
          return new Date(c.fechaRegistro).toISOString().startsWith(this.filtroFechaRegistro);
        } catch {
          return false;
        }
      })
      .filter(c => {
        if (!this.filtroEmail) return true;
        return c.email?.toLowerCase().includes(this.filtroEmail.toLowerCase()) || false;
      });

    const inicio = (this.paginaActual - 1) * this.clientesPorPagina;
    this.clientesFiltrados = filtrados.slice(inicio, inicio + this.clientesPorPagina);
  }

  cambiarPagina(pagina: number): void {
    const totalFiltrados = this.clientes.filter(c => {
      if (!c) return false;
      const busquedaLower = this.busqueda.toLowerCase();
      const coincideBusqueda = (
        (c.nombre?.toLowerCase().includes(busquedaLower) || false) ||
        (c.email?.toLowerCase().includes(busquedaLower) || false) ||
        (c.cif?.toLowerCase().includes(busquedaLower) || false)
      );
      const coincideFecha = !this.filtroFechaRegistro || (c.fechaRegistro && new Date(c.fechaRegistro).toISOString().startsWith(this.filtroFechaRegistro));
      const coincideEmail = !this.filtroEmail || (c.email?.toLowerCase().includes(this.filtroEmail.toLowerCase()) || false);
      return coincideBusqueda && coincideFecha && coincideEmail;
    }).length;

    const maxPaginas = Math.ceil(totalFiltrados / this.clientesPorPagina);

    if (pagina < 1 || pagina > maxPaginas) return;

    this.paginaActual = pagina;
    this.aplicarFiltros();
  }

  ver(cliente: Cliente): void {
    console.log('Ver cliente', cliente);
  }

  editar(cliente: Cliente): void {
    console.log('Editar cliente', cliente);
  }

  reservar(cliente: Cliente): void {
    console.log('Reservar para cliente', cliente);
  }

  nuevoCliente(): void {
    console.log('Nuevo cliente');
  }

}
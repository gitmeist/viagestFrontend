import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../core/service/cliente.service';


interface Cliente {
  cif: string;
  nombre: string;
  email: string;
  telefono: string;
  domicilio: string;
  fechaNacimiento: Date | string;
  fechaRegistro: Date | string;
}

@Component({
  selector: 'app-cliente',
  imports: [FormsModule, RouterModule, CommonModule],
  

templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})


export class ClienteComponent implements OnInit {

  clientes: Cliente[] = [];        // Lista completa de clientes
  clientesFiltrados: Cliente[] = []; // Lista filtrada para paginación

  // Paginación
  paginaActual = 1;
  clientesPorPagina = 5;

  // Filtros
  busqueda = '';
  filtroFechaRegistro = '';
  filtroEmail = '';

  constructor(private clienteService: ClienteService) { }

  ngOnInit(): void {
    this.cargarClientes();
  }

  /** Cargar clientes desde la API */
  cargarClientes(): void {
    this.clienteService.buscarTodos().subscribe({
      next: (data) => {
        this.clientes = data;
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error al cargar clientes', err)
    });
  }

  /** Aplicar filtros y paginación */
  aplicarFiltros(): void {
    this.clientesFiltrados = this.clientes
      .filter(c =>
        c.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        c.email.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        c.cif.toLowerCase().includes(this.busqueda.toLowerCase())
      )
      .filter(c => !this.filtroFechaRegistro || new Date(c.fechaRegistro).toISOString().startsWith(this.filtroFechaRegistro))
      .filter(c => !this.filtroEmail || c.email.includes(this.filtroEmail))
      .slice(
        (this.paginaActual - 1) * this.clientesPorPagina,
        this.paginaActual * this.clientesPorPagina
      );
  }

  /** Cambiar página */
  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.aplicarFiltros();
  }

  /** Acciones sobre cliente */
  editar(cliente: Cliente): void {
    console.log('Editar', cliente);
    // Aquí iría la navegación a un formulario con el cliente seleccionado
  }

  borrar(cliente: Cliente): void {
    if (confirm(`¿Desea eliminar al cliente ${cliente.nombre}?`)) {
      this.clienteService.eliminar(cliente.cif).subscribe({
        next: () => this.cargarClientes(),
        error: (err) => console.error('Error al borrar cliente', err)
      });
    }
  }

  ver(cliente: Cliente): void {
    console.log('Ver', cliente);
    // Aquí iría la navegación a una vista detallada del cliente
  }

}
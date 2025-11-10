import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../core/service/cliente.service';
import { Cliente } from '../../shared/interfaces/cliente';

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

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarClientes();
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

  borrar(cliente: Cliente): void {
    if (confirm(`¿Desea eliminar al cliente ${cliente.nombre}?`)) {
      this.clienteService.eliminar(cliente.cif).subscribe(() => this.cargarClientes());
    }
  }

  reservar(cliente: Cliente): void {
    console.log('Reservar para cliente', cliente);
  }

  nuevoCliente(): void {
    console.log('Nuevo cliente');
  }

}
import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Reserva } from '../../shared/interfaces/reserva';
import { ReservaService } from '../../core/service/reserva.service';

@Component({
  selector: 'app-reserva',
  imports: [CommonModule, FormsModule],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent implements OnInit {
 reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];
Math = Math;
  
  // filtros
  busqueda = '';
  filtroEstado = '';
  rangoFecha = { desde: '', hasta: '' };

  // paginacion
  paginaActual = 1;
  reservasPorPagina = 10;
  totalFiltradas = 0;

  // resumen
  total = 0;
  pendientes = 0;
  confirmadas = 0;
  canceladas = 0;

  constructor(private reservaService: ReservaService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservaService.buscarTodas().subscribe({
      next: (data) => {
        this.reservas = data || [];
        this.actualizarResumen();
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error cargando reservas', err);
        this.reservas = [];
        this.reservasFiltradas = [];
      }
    });
  }

  aplicarFiltros(): void {
    let filtradas = (this.reservas || []).filter(r => !!r);

    // búsqueda por cliente o paquete
    if (this.busqueda && this.busqueda.trim() !== '') {
      const b = this.busqueda.toLowerCase();
      filtradas = filtradas.filter(r =>
        (r.cliente?.nombre || '').toLowerCase().includes(b) ||
        (r.paquete?.nombre || '').toLowerCase().includes(b)
      );
    }

    // estado
    if (this.filtroEstado) {
      filtradas = filtradas.filter(r => r.estadoReserva === this.filtroEstado);
    }

    // rango fecha (fechaViaje)
    if (this.rangoFecha.desde) {
      const desde = new Date(this.rangoFecha.desde);
      filtradas = filtradas.filter(r => new Date(r.fechaViaje) >= desde);
    }
    if (this.rangoFecha.hasta) {
      const hasta = new Date(this.rangoFecha.hasta);
      filtradas = filtradas.filter(r => new Date(r.fechaViaje) <= hasta);
    }

    // actualizar totales y paginar
    this.totalFiltradas = filtradas.length;
    const inicio = (this.paginaActual - 1) * this.reservasPorPagina;
    this.reservasFiltradas = filtradas.slice(inicio, inicio + this.reservasPorPagina);
  }

  cambiarPagina(nueva: number): void {
    const max = this.totalPages;
    if (nueva < 1 || nueva > max) return;
    this.paginaActual = nueva;
    this.aplicarFiltros();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFiltradas / this.reservasPorPagina));
  }

  // Genera array de números de página
  pageNumbers(): number[] {
    const pages = [];
    const max = this.totalPages;
    for (let i = 1; i <= max; i++) pages.push(i);
    return pages;
  }

  estadoClass(estado: string | undefined): string {
    if (!estado) return '';
    return estado.toLowerCase() === 'confirmada' ? 'confirmada' :
           estado.toLowerCase() === 'pendiente' ? 'pendiente' : 'cancelada';
  }

  actualizarResumen(): void {
    this.total = this.reservas.length;
    this.pendientes = this.reservas.filter(r => r.estadoReserva === 'PENDIENTE').length;
    this.confirmadas = this.reservas.filter(r => r.estadoReserva === 'CONFIRMADA').length;
    this.canceladas = this.reservas.filter(r => r.estadoReserva === 'CANCELADA').length;
  }

  ver(r: Reserva): void { console.log('Ver', r); }
  editar(r: Reserva): void { console.log('Editar', r); }
  borrar(r: Reserva): void {
    if (!confirm(`¿Eliminar reserva ${r.idReserva}?`)) return;
    this.reservaService.eliminar(r.idReserva).subscribe({
      next: () => { this.cargarReservas(); },
      error: (e) => alert('Error al eliminar')
    });
  }

  nuevoRegistro(): void {
    console.log('Crear nueva reserva');
  }
}
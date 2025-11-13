import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Reserva } from '../../shared/interfaces/reserva';
import { ReservaService } from '../../core/service/reserva.service';
import { PagoService } from '../../core/service/pago.service';
import { Pago } from '../../shared/interfaces/pago';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-reserva',
  imports: [CommonModule, FormsModule,  MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,],
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

  // Modal ver detalles
  mostrarModalVer = false;
  reservaVer: Reserva | null = null;
  modoEdicion = false;
  pagoReserva: Pago | null = null;
  mostrarSeccionPago = false;

  // Sorting
  columnaOrden: string = '';
  ordenAscendente: boolean = true;

  // Payment statuses map
  pagosEstados: Map<number, string> = new Map();

  constructor(private reservaService: ReservaService, private pagoService: PagoService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservaService.buscarTodas().subscribe({
      next: (data) => {
        this.reservas = data || [];
        this.actualizarResumen();
        this.cargarEstadosPagos();
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error cargando reservas', err);
        this.reservas = [];
        this.reservasFiltradas = [];
      }
    });
  }

  cargarEstadosPagos(): void {
    this.reservas.forEach(reserva => {
      this.pagoService.buscarPorReserva(reserva.idReserva).subscribe({
        next: (pagos) => {
          if (pagos && pagos.length > 0) {
            this.pagosEstados.set(reserva.idReserva, pagos[0].estadoPago);
          }
        },
        error: (err) => {
          console.error('Error al cargar estado del pago', err);
        }
      });
    });
  }

  obtenerEstadoPago(idReserva: number): string {
    return this.pagosEstados.get(idReserva) || 'SIN PAGO';
  }

  estadoPagoClass(estado: string): string {
    switch(estado.toUpperCase()) {
      case 'COMPLETADO': return 'badge bg-success';
      case 'PENDIENTE': return 'badge bg-warning text-dark';
      case 'FALLIDO': return 'badge bg-danger';
      case 'CANCELADO': return 'badge bg-secondary';
      default: return 'badge bg-light text-dark';
    }
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

    // Apply sorting
    if (this.columnaOrden) {
      filtradas = this.ordenarReservas(filtradas, this.columnaOrden, this.ordenAscendente);
    }

    // actualizar totales y paginar
    this.totalFiltradas = filtradas.length;
    const inicio = (this.paginaActual - 1) * this.reservasPorPagina;
    this.reservasFiltradas = filtradas.slice(inicio, inicio + this.reservasPorPagina);
  }

  ordenarPor(columna: string): void {
    if (this.columnaOrden === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true;
    }
    this.aplicarFiltros();
  }

  ordenarReservas(reservas: Reserva[], columna: string, ascendente: boolean): Reserva[] {
    return [...reservas].sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch(columna) {
        case 'idReserva':
          valorA = a.idReserva;
          valorB = b.idReserva;
          break;
        case 'nombre':
          valorA = a.cliente?.nombre || '';
          valorB = b.cliente?.nombre || '';
          break;
        case 'paquete':
          valorA = a.paquete?.nombre || '';
          valorB = b.paquete?.nombre || '';
          break;
        case 'fechaReserva':
          valorA = new Date(a.fechaReserva).getTime();
          valorB = new Date(b.fechaReserva).getTime();
          break;
        case 'fechaViaje':
          valorA = new Date(a.fechaViaje).getTime();
          valorB = new Date(b.fechaViaje).getTime();
          break;
        case 'numPersonas':
          valorA = a.numPersonas;
          valorB = b.numPersonas;
          break;
        case 'estadoReserva':
          valorA = a.estadoReserva;
          valorB = b.estadoReserva;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return ascendente ? -1 : 1;
      if (valorA > valorB) return ascendente ? 1 : -1;
      return 0;
    });
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

  ver(r: Reserva): void {
    this.reservaService.buscarUna(r.idReserva).subscribe({
      next: (reserva) => {
        this.reservaVer = reserva;
        this.modoEdicion = false;
        this.mostrarModalVer = true;
        this.cargarPagoReserva(reserva.idReserva);
      },
      error: (err) => {
        console.error('Error al cargar reserva', err);
        alert('Error al cargar los detalles de la reserva');
      }
    });
  }

  cargarPagoReserva(idReserva: number): void {
    this.pagoService.buscarPorReserva(idReserva).subscribe({
      next: (pagos) => {
        if (pagos && pagos.length > 0) {
          this.pagoReserva = pagos[0]; // Get first payment
        } else {
          this.pagoReserva = null;
        }
      },
      error: (err) => {
        console.error('Error al cargar pago', err);
        this.pagoReserva = null;
      }
    });
  }

  cerrarModalVer(): void {
    this.mostrarModalVer = false;
    this.reservaVer = null;
    this.modoEdicion = false;
    this.pagoReserva = null;
    this.mostrarSeccionPago = false;
  }

  toggleEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
    if (this.modoEdicion && this.reservaVer) {
      this.mostrarSeccionPago = true;
      if (!this.pagoReserva) {
        this.cargarPagoReserva(this.reservaVer.idReserva);
      }
    } else {
      this.mostrarSeccionPago = false;
    }
  }

  actualizarReserva(): void {
    if (!this.reservaVer) return;
    this.reservaService.modificar(this.reservaVer.idReserva, this.reservaVer).subscribe({
      next: (reservaActualizada) => {
        console.log('Reserva actualizada', reservaActualizada);
        
        // Update payment if exists
        if (this.pagoReserva) {
          this.pagoService.modificar(this.pagoReserva.idPago, this.pagoReserva).subscribe({
            next: (pagoActualizado) => {
              console.log('Pago actualizado', pagoActualizado);
              this.cargarReservas();
              this.cerrarModalVer();
              alert('Reserva y pago actualizados correctamente');
            },
            error: (err) => {
              console.error('Error al actualizar pago', err);
              this.cargarReservas();
              this.cerrarModalVer();
              alert('Reserva actualizada, pero hubo un error al actualizar el pago');
            }
          });
        } else {
          this.cargarReservas();
          this.cerrarModalVer();
          alert('Reserva actualizada correctamente');
        }
      },
      error: (err) => {
        console.error('Error al actualizar reserva', err);
        alert('Error al actualizar la reserva');
      }
    });
  }
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
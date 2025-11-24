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
  standalone: true,
  selector: 'app-reserva',
  imports: [CommonModule, FormsModule, MatDatepickerModule,
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
  filtroFechaReserva: string | null = null;

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

  columnaOrden: string = '';
  ordenAscendente: boolean = true;

  // Estado pago
  pagosEstados: Map<number, string> = new Map();

  constructor(private reservaService: ReservaService, private pagoService: PagoService) { }

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservaService.buscarTodas().subscribe({
      next: data => {
        this.reservas = (data || []).map(r => ({
          ...r,
          fechaReserva: new Date(r.fechaReserva),
          fechaViaje: new Date(r.fechaViaje)
        }));
        this.aplicarFiltros();
        this.actualizarResumen();
        this.cargarEstadosPagos();
      },
      error: err => console.error(err)
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

  formatearEstadoPago(estado: string): string {
    const normalizado = estado.trim().toLowerCase();

    if (normalizado.includes('complet') || normalizado === 'pagado')
      return 'Pago completado';

    if (normalizado.includes('pend'))
      return 'Pago pendiente';

    if (normalizado.includes('reemb') || normalizado.includes('dev'))
      return 'Pago reembolsado';

    return 'Sin pago';
  }


  estadoPagoClass(estado: string): string {
    switch (estado.toUpperCase()) {
      case 'COMPLETADO': return 'completado';
      case 'PENDIENTE': return 'pendiente';
      case 'REEMBOLSADO': return 'reembolsado';
      default: return 'sin-pago';
    }
  }


  aplicarFiltros(): void {
    let filtradas = [...this.reservas];

    // Buscar por cliente o paquete
    if (this.busqueda.trim()) {
      const b = this.busqueda.toLowerCase();
      filtradas = filtradas.filter(r =>
        r.cliente.nombre.toLowerCase().includes(b) ||
        r.paquete.nombre.toLowerCase().includes(b)
      );
    }

    // Filtrar por estado
    if (this.filtroEstado) {
      filtradas = filtradas.filter(r => r.estadoReserva === this.filtroEstado);
    }

    // Filtrar por fecha de reserva
    if (this.filtroFechaReserva) {
      const fechaSeleccion = new Date(this.filtroFechaReserva);
      fechaSeleccion.setHours(0, 0, 0, 0);

      filtradas = filtradas.filter(r => {
        const fechaReserva = new Date(r.fechaReserva);
        fechaReserva.setHours(0, 0, 0, 0);
        return fechaReserva.getTime() === fechaSeleccion.getTime();
      });
    }

    // --------------------------------------------
    this.totalFiltradas = filtradas.length;
    const inicio = (this.paginaActual - 1) * this.reservasPorPagina;

    this.reservasFiltradas = filtradas.slice(inicio, inicio + this.reservasPorPagina);
  }

  resetearFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = '';
    this.filtroFechaReserva = null;
    this.paginaActual = 1;
    this.aplicarFiltros();
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

      switch (columna) {
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
        case 'estadoPago':
          valorA = this.obtenerEstadoPago(a.idReserva);
          valorB = this.obtenerEstadoPago(b.idReserva);
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
          this.pagoReserva = pagos[0];
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
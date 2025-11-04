import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Reserva } from '../../../entities/reserva';
import { ReservaService } from '../../../service/reserva.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reserva',
  imports: [CommonModule, FormsModule],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent implements OnInit {
reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];

  // Filtros
  busqueda = '';
  filtroEstado = '';
  rangoFecha = { desde: '', hasta: '' };

  // Paginación
  paginaActual = 1;
  reservasPorPagina = 10;

  // Contadores resumen
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
        this.reservas = data;
        this.actualizarResumen();
      },
      error: (err) => {
        console.error('Error cargando reservas:', err);
      }
    });
  }

  obtenerReservasFiltradas(): Reserva[] {
    let filtradas = this.reservas;

    if (this.busqueda) {
      const b = this.busqueda.toLowerCase();
      filtradas = filtradas.filter(r =>
        r.cliente.nombre.toLowerCase().includes(b) ||
        r.paquete.nombre.toLowerCase().includes(b)
      );
    }

    if (this.filtroEstado) {
      filtradas = filtradas.filter(r => r.estadoReserva === this.filtroEstado);
    }

    if (this.rangoFecha.desde) {
      filtradas = filtradas.filter(r =>
        new Date(r.fechaViaje) >= new Date(this.rangoFecha.desde)
      );
    }

    if (this.rangoFecha.hasta) {
      filtradas = filtradas.filter(r =>
        new Date(r.fechaViaje) <= new Date(this.rangoFecha.hasta)
      );
    }

    this.reservasFiltradas = filtradas;
    return filtradas.slice((this.paginaActual - 1) * this.reservasPorPagina, this.paginaActual * this.reservasPorPagina);
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.obtenerReservasFiltradas();
  }

  actualizarResumen(): void {
    this.total = this.reservas.length;
    this.pendientes = this.reservas.filter(r => r.estadoReserva === 'PENDIENTE').length;
    this.confirmadas = this.reservas.filter(r => r.estadoReserva === 'CONFIRMADA').length;
    this.canceladas = this.reservas.filter(r => r.estadoReserva === 'CANCELADA').length;
  }

  ver(reserva: Reserva): void {
    alert(`Reserva ${reserva.idReserva} seleccionada`);
  }

  editar(reserva: Reserva): void {
    alert(`Editar reserva ${reserva.idReserva}`);
  }

  borrar(reserva: Reserva): void {
    if (confirm(`¿Seguro que deseas eliminar la reserva #${reserva.idReserva}?`)) {
      this.reservaService.eliminar(reserva.idReserva).subscribe({
        next: () => {
          alert('Reserva eliminada con éxito');
          this.cargarReservas();
        },
        error: () => alert('Error al borrar la reserva')
      });
    }
  }
}
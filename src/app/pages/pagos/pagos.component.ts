import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EstadoPago } from '../../shared/interfaces/estado-pago';
import { MetodoPago } from '../../shared/interfaces/metodo-pago';
import { PagoService } from '../../core/service/pago.service';
import { Pago } from '../../shared/interfaces/pago';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css'
})
export class PagosComponent implements OnInit {
  pagos: Pago[] = [];
  pagosFiltrados: Pago[] = [];
  estados = Object.values(EstadoPago);
  metodos = Object.values(MetodoPago);

  filtroTexto = '';
  filtroEstado = '';
  filtroMetodo = '';
  rangoFecha = { desde: '', hasta: '' };

  // 🔹 Paginación
  paginaActual = 1;
  elementosPorPagina = 5;
  paginasTotales: number[] = [];

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    this.cargarPagos();
  }

  /** Carga todos los pagos del backend */
  cargarPagos(): void {
    this.pagoService.buscarTodos().subscribe({
      next: (data) => {
        this.pagos = data;
        this.aplicarFiltros(); // Filtra y pagina al cargar
      },
      error: (err) => console.error('Error al cargar pagos', err)
    });
  }

  /** Aplica filtros y actualiza la paginación */
  aplicarFiltros(): void {
    this.pagosFiltrados = this.pagos.filter(pago => {
      const texto = this.filtroTexto.toLowerCase();
      const coincideTexto =
        !texto ||
        pago.referencia.toLowerCase().includes(texto) ||
        pago.reserva.cliente?.nombre?.toLowerCase().includes(texto);

      const coincideEstado = !this.filtroEstado || pago.estadoPago === this.filtroEstado;
      const coincideMetodo = !this.filtroMetodo || pago.metodoPago === this.filtroMetodo;

      const fecha = new Date(pago.fechaPago).getTime();
      const desde = this.rangoFecha.desde ? new Date(this.rangoFecha.desde).getTime() : null;
      const hasta = this.rangoFecha.hasta ? new Date(this.rangoFecha.hasta).getTime() : null;
      const coincideFecha = (!desde || fecha >= desde) && (!hasta || fecha <= hasta);

      return coincideTexto && coincideEstado && coincideMetodo && coincideFecha;
    });

    this.actualizarPaginacion();
  }

  /** Actualiza el número total de páginas dinámicamente */
  actualizarPaginacion(): void {
    const totalPaginas = Math.ceil(this.pagosFiltrados.length / this.elementosPorPagina);
    this.paginasTotales = Array.from({ length: totalPaginas }, (_, i) => i + 1);
    this.paginaActual = 1;
  }

  /** Cambia de página */
  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.paginasTotales.length) return;
    this.paginaActual = pagina;
  }

  /** Obtiene los pagos visibles según la página */
  get pagosPaginados(): Pago[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.pagosFiltrados.slice(inicio, inicio + this.elementosPorPagina);
  }

  /** Marca el pago como aceptado */
  aceptarPago(pago: Pago): void {
    if (!confirm(`¿Confirmar el pago #${pago.idPago}?`)) return;

    this.pagoService.aceptarPago(pago.idPago).subscribe({
      next: (res) => {
        const index = this.pagos.findIndex(p => p.idPago === res.idPago);
        if (index !== -1) this.pagos[index] = res;
        this.aplicarFiltros();
        alert(`Pago #${pago.idPago} aceptado correctamente`);
      },
      error: (err) => {
        console.error('Error al aceptar el pago:', err);
        alert('No se pudo aceptar el pago');
      }
    });
  }

  /** Devuelve clases CSS según estado */
  getEstadoCss(estado: EstadoPago): string {
    return {
      'COMPLETADO': 'badge-confirmado',
      'PENDIENTE': 'badge-pendiente',
      'FALLIDO': 'badge-fallido',
      'CANCELADO': 'badge-cancelado',
      'DEVUELTO': 'badge-devuelto'
    }[estado] || '';
  }
}

import { Component } from '@angular/core';
import { Pago } from '../../../entities/pago';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagoService } from '../../../service/pago.service';
import { EstadoPago } from '../../../entities/estado-pago';
import { MetodoPago } from '../../../entities/metodo-pago';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-pagos',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css'
})
export class PagosComponent implements OnInit {

  pagos: Pago[] = [];            // Lista total de pagos traídos de la API
  pagosFiltrados: Pago[] = [];   // Lista visible según filtros
  estados = Object.values(EstadoPago);   // ['PENDIENTE', 'CONFIRMADO', 'FALLIDO']
  metodos = Object.values(MetodoPago);   // ['TARJETA', 'TRANSFERENCIA', 'EFECTIVO']

  filtroTexto = '';
  filtroEstado = '';
  filtroMetodo = '';
  rangoFecha = { desde: '', hasta: '' };

  // Paginación manual (frontend)
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    this.cargarPagos();
  }

  /** Llama al backend y trae todos los pagos */
  cargarPagos(): void {
    this.pagoService.buscarTodos().subscribe({
      next: (data) => {
        this.pagos = data;
        this.pagosFiltrados = [...this.pagos];
      },
      error: (err) => console.error('Error al cargar pagos', err)
    });
  }

  /** Filtrar por texto, estado, método o fechas */
  aplicarFiltros(): void {
    this.pagosFiltrados = this.pagos.filter(pago => {

      const coincideTexto =
        this.filtroTexto === '' ||
        pago.referencia.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        pago.reserva.cliente?.nombre?.toLowerCase().includes(this.filtroTexto.toLowerCase());

      const coincideEstado =
        this.filtroEstado === '' || pago.estadoPago === this.filtroEstado;

      const coincideMetodo =
        this.filtroMetodo === '' || pago.metodoPago === this.filtroMetodo;

      const fecha = new Date(pago.fechaPago).getTime();
      const desde = this.rangoFecha.desde ? new Date(this.rangoFecha.desde).getTime() : null;
      const hasta = this.rangoFecha.hasta ? new Date(this.rangoFecha.hasta).getTime() : null;

      const coincideFecha =
        (!desde || fecha >= desde) &&
        (!hasta || fecha <= hasta);

      return coincideTexto && coincideEstado && coincideMetodo && coincideFecha;
    });

    this.paginaActual = 1; // Reset paginación al filtrar
  }

  /** Elimina un pago */
  eliminarPago(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este pago?')) return;
    this.pagoService.eliminar(id).subscribe({
      next: () => {
        this.pagos = this.pagos.filter(p => p.idPago !== id);
        this.aplicarFiltros();
      },
      error: () => alert('Error al eliminar el pago')
    });
  }

  /** Simulación de pago confirmado */
  confirmarPago(pago: Pago): void {
    const actualizado: Pago = { ...pago, estadoPago: EstadoPago.PENDIENTE };

    this.pagoService.modificar(pago.idPago, actualizado).subscribe({
      next: (res) => {
        const index = this.pagos.findIndex(p => p.idPago === res.idPago);
        this.pagos[index] = res;
        this.aplicarFiltros();
      },
      error: () => alert('Error al confirmar el pago')
    });
  }

  /** Devuelve los elementos visibles para la página actual */
  get pagosPaginados(): Pago[] {
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.pagosFiltrados.slice(start, start + this.elementosPorPagina);
  }

  cambiarPagina(nueva: number): void {
    this.paginaActual = nueva;
  }

  /** Clases dinámicas para badges */
  getEstadoCss(estado: EstadoPago): string {
    return {
      'COMPLETADO': 'badge-confirmado',
      'PENDIENTE': 'badge-pendiente',
      'FALLIDO': 'badge-fallido'
    }[estado] || '';
  }
}
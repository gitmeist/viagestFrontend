import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EstadoPago } from '../../shared/interfaces/estado-pago';
import { MetodoPago } from '../../shared/interfaces/metodo-pago';
import { PagoService } from '../../core/service/pago.service';
import { FacturaService } from '../../core/service/factura.service';
import { Factura } from '../../shared/interfaces/factura';
import { Pago } from '../../shared/interfaces/pago';
import { ReservaService } from '../../core/service/reserva.service';
import { Reserva } from '../../shared/interfaces/reserva';
import { EstadoReserva } from '../../shared/interfaces/estado-reserva';

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
  filtroFecha = '';

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalFiltrados = 0;
  Math = Math; // Para usar en el template

  // Modal ver pago
  mostrarModalVerPago = false;
  pagoVer: Pago | null = null;
  modoEdicion = false;

  constructor(
    private pagoService: PagoService,
    private facturaService: FacturaService,
    private reservaService: ReservaService
  ) { }

  ngOnInit(): void {
    this.cargarPagos();
  }

  /** Carga todos los pagos del backend */
  cargarPagos(): void {
    this.pagoService.buscarTodos().subscribe({
      next: (data: Pago[]) => {
        this.pagos = data;
        this.aplicarFiltros();
      },
      error: (err: any) => console.error('Error al cargar pagos', err)
    });
  }

  /** Aplica filtros y actualiza la paginación */
  aplicarFiltros(): void {
    const filtrados = this.pagos.filter(pago => {
      const texto = this.filtroTexto.toLowerCase();
      const coincideTexto =
        !texto ||
        pago.reserva.cliente?.nombre?.toLowerCase().includes(texto);

      const coincideEstado = !this.filtroEstado || pago.estadoPago === this.filtroEstado;
      const coincideMetodo = !this.filtroMetodo || pago.metodoPago === this.filtroMetodo;

      let coincideFecha = true;
      if (this.filtroFecha) {
        const fechaPago = new Date(pago.fechaPago).toISOString().split('T')[0];
        coincideFecha = fechaPago === this.filtroFecha;
      }

      return coincideTexto && coincideEstado && coincideMetodo && coincideFecha;
    });

    this.totalFiltrados = filtrados.length;
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    this.pagosFiltrados = filtrados.slice(inicio, inicio + this.elementosPorPagina);
  }

  /** Cambia de página */
  cambiarPagina(pagina: number): void {
    const max = this.totalPages;
    if (pagina < 1 || pagina > max) return;
    this.paginaActual = pagina;
    this.aplicarFiltros();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFiltrados / this.elementosPorPagina));
  }

  pageNumbers(): number[] {
    const pages = [];
    const max = this.totalPages;
    for (let i = 1; i <= max; i++) pages.push(i);
    return pages;
  }

  /** Obtiene los pagos visibles según la página */
  get pagosPaginados(): Pago[] {
    return this.pagosFiltrados;
  }

  /** Marca el pago como aceptado */
  aceptarPago(pago: Pago): void {
    if (!confirm(`¿Confirmar el pago #${pago.idPago}?`)) return;

    this.pagoService.aceptarPago(pago.idPago).subscribe({
      next: (res: Pago) => {
        const index = this.pagos.findIndex(p => p.idPago === res.idPago);
        if (index !== -1) this.pagos[index] = res;
        this.aplicarFiltros();
        // Tras aceptar el pago, intentar confirmar la reserva asociada
        const idReserva = pago.reserva?.idReserva;
        if (idReserva) {
          this.reservaService.buscarUna(idReserva).subscribe({
            next: (reserva: Reserva) => {
              if (reserva) {
                reserva.estadoReserva = EstadoReserva.CONFIRMADA;
                this.reservaService.modificar(reserva.idReserva, reserva).subscribe({
                  next: () => {
                    alert(`Pago #${pago.idPago} aceptado y reserva #${idReserva} confirmada correctamente`);
                  },
                  error: (err: any) => {
                    console.error('Pago aceptado pero no se pudo confirmar la reserva:', err);
                    alert(`Pago #${pago.idPago} aceptado, pero no se pudo confirmar la reserva #${idReserva}`);
                  }
                });
              } else {
                alert(`Pago #${pago.idPago} aceptado correctamente`);
              }
            },
            error: (err: any) => {
              console.error('Error al obtener la reserva para confirmar:', err);
              alert(`Pago #${pago.idPago} aceptado, pero no se pudo obtener la reserva #${idReserva}`);
            }
          });
        } else {
          alert(`Pago #${pago.idPago} aceptado correctamente`);
        }
      },
      error: (err: any) => {
        console.error('Error al aceptar el pago:', err);
        alert('No se pudo aceptar el pago');
      }
    });
  }

  /** Marca el pago como fallido */
  marcarComoFallido(pago: Pago): void {
    if (!confirm(`¿Marcar el pago #${pago.idPago} como FALLIDO?`)) return;

    this.pagoService.fallarPago(pago.idPago).subscribe({
      next: (res: Pago) => {
        const index = this.pagos.findIndex(p => p.idPago === res.idPago);
        if (index !== -1) this.pagos[index] = res;
        this.aplicarFiltros();
        alert(`Pago #${pago.idPago} marcado como FALLIDO`);
      },
      error: (err: any) => {
        console.error('Error al marcar pago como fallido:', err);
        alert('No se pudo marcar el pago como fallido');
      }
    });
  }

  abrirModalVerPago(pago: Pago): void {
    this.pagoVer = pago;
    this.mostrarModalVerPago = true;
    this.modoEdicion = false;
  }

  cerrarModalVerPago(): void {
    this.mostrarModalVerPago = false;
    this.pagoVer = null;
  }

  toggleEdicionPago(): void {
    this.modoEdicion = !this.modoEdicion;
    // make a defensive copy when entering edit mode to avoid mutating list before save
    if (this.modoEdicion && this.pagoVer) {
      this.pagoVer = { ...this.pagoVer } as Pago;
    }
  }

  actualizarPago(): void {
    if (!this.pagoVer) return;
    const id = this.pagoVer.idPago;
    this.pagoService.modificar(id, this.pagoVer).subscribe({
      next: (res: Pago) => {
        // update local array
        const idx = this.pagos.findIndex(p => p.idPago === res.idPago);
        if (idx !== -1) this.pagos[idx] = res;
        this.aplicarFiltros();
        this.modoEdicion = false;
        alert('Pago actualizado correctamente');
      },
      error: (err: any) => {
        console.error('Error al actualizar pago', err);
        alert('No se pudo actualizar el pago');
      }
    });
  }

  generarFactura(): void {
    if (!this.pagoVer) return;
    const idPago = this.pagoVer.idPago;

    // Primero intentar obtener factura asociada
    this.facturaService.buscarPorPago(idPago).subscribe({
      next: (factura: Factura) => {
        this.generarPDFDesdeFactura(factura);
      },
      error: () => {
        // Si no existe, crear una factura básica a partir del pago
        const subtotal = Number(this.pagoVer?.monto || 0);
        const impuestos = +(subtotal * 0.21).toFixed(2); // ejemplo 21% IVA
        const nueva: Factura = {
          idFactura: 0,
          numeroFactura: `F-${Date.now()}`,
          fechaEmision: new Date().toISOString(),
          subtotal,
          impuestos,
          total: +(subtotal + impuestos).toFixed(2),
          detalles: 'Factura generada automáticamente desde el pago',
          pago: this.pagoVer as any
        };

        this.facturaService.alta(nueva).subscribe({
          next: (f: Factura) => this.generarPDFDesdeFactura(f),
          error: (err: any) => {
            console.error('Error al crear factura:', err);
            alert('No se pudo crear la factura');
          }
        });
      }
    });
  }

  private async generarPDFDesdeFactura(factura: Factura): Promise<void> {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const left = 20;
      let y = 20;

      doc.setFontSize(18);
      doc.text('Factura', left, y);
      y += 8;

      doc.setFontSize(11);
      doc.text(`Número: ${factura.numeroFactura}`, left, y);
      y += 6;
      doc.text(`Fecha emisión: ${new Date(factura.fechaEmision).toLocaleString()}`, left, y);
      y += 8;

      doc.setFontSize(13);
      doc.text('Datos del Pago', left, y);
      y += 7;
      doc.setFontSize(11);
      const p = factura.pago;
      doc.text(`ID Pago: ${p?.idPago ?? '-'}`, left, y);
      y += 6;
      doc.text(`Cliente: ${p?.reserva?.cliente?.nombre ?? '-'}`, left, y);
      y += 6;
      doc.text(`Método: ${p?.metodoPago ?? '-'}`, left, y);
      y += 6;
      doc.text(`Fecha pago: ${p?.fechaPago ? new Date(p.fechaPago).toLocaleString() : '-'}`, left, y);
      y += 8;

      doc.setFontSize(13);
      doc.text('Resumen factura', left, y);
      y += 7;
      doc.setFontSize(11);
      doc.text(`Subtotal: ${factura.subtotal.toFixed(2)} €`, left, y);
      y += 6;
      doc.text(`Impuestos: ${factura.impuestos.toFixed(2)} €`, left, y);
      y += 6;
      doc.text(`Total: ${factura.total.toFixed(2)} €`, left, y);
      y += 10;

      doc.setFontSize(11);
      doc.text('Detalles:', left, y);
      y += 6;
      // Wrap detalles text
      const detalles = factura.detalles || '';
      const split = doc.splitTextToSize(detalles, 170);
      doc.text(split, left, y);

      const filename = `${factura.numeroFactura || 'factura'}_${factura.idFactura || Date.now()}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generando PDF. ¿instalaste jspdf?', err);
      alert('No se pudo generar el PDF. Asegúrate de instalar la dependencia `jspdf` con: npm install jspdf');
    }
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

  /** Restablece todos los filtros */
  resetFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = '';
    this.filtroMetodo = '';
    this.filtroFecha = '';
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

}

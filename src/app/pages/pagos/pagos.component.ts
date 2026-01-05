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
  Math = Math; 

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
        // Tras aceptar el pago,confirma la reserva asociada
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
    if (this.modoEdicion && this.pagoVer) {
      this.pagoVer = { ...this.pagoVer } as Pago;
    }
  }

  actualizarPago(): void {
    if (!this.pagoVer) return;
    const id = this.pagoVer.idPago;
    this.pagoService.modificar(id, this.pagoVer).subscribe({
      next: (res: Pago) => {
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
        const impuestos = +(subtotal * 0.21).toFixed(2); 
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

      // Colores corporativos
      const primaryColor = [79, 169, 169]; // #4fa9a9 (Turquesa)
      const darkColor = [40, 99, 118];     // #286376 (Azul oscuro)
      const lightGray = [245, 247, 250];   // #f5f7fa (Gris claro)
      const white = [255, 255, 255];

      // --- HEADER ---
      // Fondo del encabezado
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');

      // Título
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURA', 15, 25);

      // Datos de la empresa (Derecha)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('ViaGest S.L.', 195, 15, { align: 'right' });
      doc.text('Calle Turismo 123, Madrid', 195, 20, { align: 'right' });
      doc.text('CIF: B-12345678', 195, 25, { align: 'right' });
      doc.text('info@viagest.com', 195, 30, { align: 'right' });

      // --- INFO FACTURA & CLIENTE ---
      let y = 55;
      const left = 15;
      const right = 120;

      // Columna Izquierda: Cliente
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURAR A:', left, y);
      
      y += 7;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const clienteNombre = factura.pago?.reserva?.cliente?.nombre || 'Cliente General';
      doc.text(clienteNombre, left, y);
      
      // Columna Derecha: Detalles Factura
      y = 55;
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLES:', right, y);
      
      y += 7;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nº Factura:`, right, y);
      doc.text(`${factura.numeroFactura}`, right + 30, y);
      
      y += 5;
      doc.text(`Fecha:`, right, y);
      doc.text(`${new Date(factura.fechaEmision).toLocaleDateString()}`, right + 30, y);
      
      y += 5;
      doc.text(`Método Pago:`, right, y);
      doc.text(`${factura.pago?.metodoPago || '-'}`, right + 30, y);

      // --- TABLA DE CONCEPTOS ---
      y = 90;
      
      // Encabezado Tabla
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(15, y, 180, 10, 'F');
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DESCRIPCIÓN', 20, y + 7);
      doc.text('IMPORTE', 190, y + 7, { align: 'right' });

      // Fila 1 (Detalles)
      y += 18;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      const descripcion = factura.detalles || `Pago de reserva #${factura.pago?.reserva?.idReserva || ''}`;
      const splitDesc = doc.splitTextToSize(descripcion, 130);
      doc.text(splitDesc, 20, y);
      
      doc.text(`${factura.subtotal.toFixed(2)} €`, 190, y, { align: 'right' });

      // --- TOTALES ---
      y += 40; // Espacio fijo para simplificar
      
      // Línea separadora
      doc.setDrawColor(220, 220, 220);
      doc.line(120, y, 195, y);
      y += 5;

      // Subtotal
      doc.setFontSize(10);
      doc.text('Subtotal:', 140, y);
      doc.text(`${factura.subtotal.toFixed(2)} €`, 190, y, { align: 'right' });
      
      y += 6;
      doc.text('Impuestos (21%):', 140, y);
      doc.text(`${factura.impuestos.toFixed(2)} €`, 190, y, { align: 'right' });

      y += 10;
      // Total destacado
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(135, y - 6, 60, 14, 'F');
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL:', 140, y + 3);
      doc.text(`${factura.total.toFixed(2)} €`, 190, y + 3, { align: 'right' });

      // --- FOOTER ---
      const pageHeight = doc.internal.pageSize.height;
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Gracias por confiar en ViaGest.', 105, pageHeight - 20, { align: 'center' });
      doc.text('Este documento es un comprobante de pago válido.', 105, pageHeight - 15, { align: 'center' });

      const filename = `Factura_${factura.numeroFactura || 'Borrador'}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generando PDF. ¿instalaste jspdf?', err);
      alert('No se pudo generar el PDF. Asegúrate de instalar la dependencia `jspdf` con: npm install jspdf');
    }
  }

  /** estado del pago */
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

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { OnInit } from '@angular/core';
import { ClienteService } from '../../core/service/cliente.service';
import { ReservaService } from '../../core/service/reserva.service';
import { PaqueteService } from '../../core/service/paquete.service';
import { EstadoReserva } from '../../shared/interfaces/estado-reserva';
import { PagoService } from '../../core/service/pago.service';
import { EstadoPago } from '../../shared/interfaces/estado-pago';
import { Reserva } from '../../shared/interfaces/reserva';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  resumen = [
    { label: 'Clientes Activos', value: 0 },
    { label: 'Reservas Mensuales', value: 0 },
    { label: 'Pendientes', value: 0 },
    { label: 'Viajes Completados', value: 0 }
  ];

  reservasActivas: Reserva[] = [];

  EstadoReserva = EstadoReserva;

  constructor(
    private clienteService: ClienteService,
    private reservaService: ReservaService,
    private pagoService: PagoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  navigateToClientes(): void {
    this.router.navigate(['/clientes']);
  }

  navigateToReservas(): void {
    this.router.navigate(['/reservas']);
  }

  private cargarDatos(): void {
    // Clientes activos
    this.clienteService.buscarTodos().subscribe((clientes: any[]) => {
      this.resumen[0].value = clientes.length;
    });

    // Reservas del mes actual y últimas reservas
    this.reservaService.buscarTodas().subscribe((reservas: Reserva[]) => {
      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

      const reservasEsteMes = reservas.filter((r: Reserva) => new Date(r.fechaReserva) >= inicioMes);
      this.resumen[1].value = reservasEsteMes.length;

      this.cargarUltimasReservas(reservas);
    });

    // Pagos pendientes
    this.pagoService.buscarTodos().subscribe((pagos: any[]) => {
      const pendientes = pagos.filter((p: any) => p.estadoPago === EstadoPago.PENDIENTE);
      this.resumen[2].value = pendientes.length;
    });
  }

  private cargarUltimasReservas(todasReservas: Reserva[]): void {
    const ordenadas = [...todasReservas].sort(
      (a, b) => new Date(b.fechaViaje).getTime() - new Date(a.fechaViaje).getTime()
    );
    this.reservasActivas = ordenadas.slice(0, 4);
  }
}

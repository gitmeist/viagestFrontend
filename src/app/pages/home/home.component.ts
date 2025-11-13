import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OnInit } from '@angular/core';
import { ClienteService } from '../../core/service/cliente.service';
import { ReservaService } from '../../core/service/reserva.service';
import { PaqueteService } from '../../core/service/paquete.service';
import { EstadoReserva } from '../../shared/interfaces/estado-reserva';
import { PagoService } from '../../core/service/pago.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  mesActual: string = '';
  
  resumen = [
    { label: 'Clientes', value: 0, icon: '👥' },
    { label: 'Reservas Activas', value: 0, icon: '📅' },
    { label: 'Paquetes Disponibles', value: 0, icon: '📦' },
    { label: '', value: '0€', icon: '💶' } // Label will be set dynamically
  ];

  reservas: any[] = [];
  reservasActivas: any[] = [];

  constructor(
    private clienteService: ClienteService,
    private reservaService: ReservaService,
    private paqueteService: PaqueteService,
    private pagoService: PagoService
  ) {}

  ngOnInit(): void {
    this.establecerMesActual();
    this.cargarDatos();
  }

  private establecerMesActual(): void {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fecha = new Date();
    this.mesActual = meses[fecha.getMonth()];
    this.resumen[3].label = `Ingresos de ${this.mesActual}`;
  }

  private cargarDatos(): void {
    // 1️⃣ Total de clientes
    this.clienteService.buscarTodos().subscribe(clientes => {
      this.resumen[0].value = clientes.length;
    });

    // 2️⃣ Reservas activas
    this.reservaService.buscarTodas().subscribe(reservas => {
      this.resumen[1].value = reservas.filter(r =>
      r.estadoReserva === 'CONFIRMADA' || r.estadoReserva === 'PENDIENTE'
      ).length;
    });

    // 3️⃣ Paquetes activos
    this.paqueteService.buscarActivos().subscribe(paquetes => {
      this.resumen[2].value = paquetes.length;
    });

    // 4️⃣ Ingresos del mes actual desde pagos
    this.cargarIngresosUltimoMes();

    this.reservaService.buscarTodas().subscribe(reservas => {
    // Actualiza el contador del resumen
    this.resumen[1].value = reservas.filter(r =>
      r.estadoReserva === 'CONFIRMADA' || r.estadoReserva === 'PENDIENTE'
    ).length;

    // Filtra las activas
    const activas = reservas.filter(r =>
      r.estadoReserva === 'CONFIRMADA' || r.estadoReserva === 'PENDIENTE'
    );

    // Ordena por fechaReserva (más recientes primero)
    activas.sort((a, b) =>
      new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime()
    );

    // Guarda las 10 más recientes
    this.reservasActivas = activas.slice(0, 10);
    });

  }

  private cargarIngresosUltimoMes(): void {
    this.pagoService.pagosUltimoMes().subscribe(pagos => {
      const total = pagos.reduce((acc, pago) => acc + (pago.monto || 0), 0);
      this.resumen[3].value = total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    });
  }
}

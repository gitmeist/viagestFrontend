import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
   resumen = [
    { label: 'Clientes', value: 1234, icon: '👥' },
    { label: 'Reservas Activas', value: 52, icon: '📅' },
    { label: 'Paquetes Disponibles', value: 12, icon: '📦' },
    { label: 'Ingresos Totales', value: '12,234€', icon: '💶' }
  ];

  reservas = [
    { cliente: 'Pedro García', paquete: 'Aventura a Londres', fecha: '2024-08-15', estado: 'Confirmada' },
    { cliente: 'Laura García', paquete: 'Escapada a Roma', fecha: '2024-08-15', estado: 'Pendiente' },
    { cliente: 'Pedro García', paquete: 'Excursión a Barcelona', fecha: '2024-08-10', estado: 'Completada' }
  ];

}

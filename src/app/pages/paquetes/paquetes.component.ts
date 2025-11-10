import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaqueteService } from '../../core/service/paquete.service';
import { Paquete } from '../../shared/interfaces/paquete';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-paquetes',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './paquetes.component.html',
  styleUrl: './paquetes.component.css'
})
export class PaquetesComponent implements OnInit {
  paquetes: Paquete[] = [];
  paquetesFiltrados: Paquete[] = [];
  busqueda = '';
  mostrarSoloActivos = false;

  constructor(private paqueteService: PaqueteService) {}

  ngOnInit(): void {
    this.cargarPaquetes();
  }

  cargarPaquetes(): void {
    this.paqueteService.buscarTodos().subscribe({
      next: (data) => {
        this.paquetes = data;
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al cargar paquetes:', error);
      }
    });
  }

  aplicarFiltros(): void {
    this.paquetesFiltrados = this.paquetes.filter(paquete => {
      const coincideBusqueda = !this.busqueda || 
        paquete.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        paquete.destino.toLowerCase().includes(this.busqueda.toLowerCase());
      
      const esActivo = !this.mostrarSoloActivos || paquete.activo;
      
      return coincideBusqueda && esActivo;
    });
  }

  toggleActivo(paquete: Paquete) {
  const nuevoEstado = !paquete.activo;
  this.paqueteService.cambiarEstado(paquete.idPaquete, nuevoEstado)
    .subscribe(actualizado => {
      paquete.activo = actualizado.activo; // Actualizar localmente
      this.aplicarFiltros(); // Reaplicar filtros si se usa filtro "solo activos"
    });
}

  
  

  eliminarPaquete(id: number): void {
    if (confirm('¿Está seguro de eliminar este paquete?')) {
      this.paqueteService.eliminar(id).subscribe({
        next: () => {
          this.cargarPaquetes();
        },
        error: (error) => {
          console.error('Error al eliminar paquete:', error);
        }
      });
    }
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaqueteService } from '../../core/service/paquete.service';
import { Paquete } from '../../shared/interfaces/paquete';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
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
  mostrarModal = false;
  nuevoPaquete: Paquete = this.crearNuevoPaquete();

  destinoSeleccionado: string = ''; // Guarda el destino elegido
  destinos: string[] = [];
  destinosDisponibles: string[] = [];

  mostrarModalVer = false;
  paqueteVer: Paquete | null = null;

  mostrarModalEditar = false;
  paqueteEditar: Paquete | null = null;

  paginaActual = 1;
  paquetesPorPagina = 8;
  totalFiltrados = 0;

  constructor(private paqueteService: PaqueteService) { }

  ngOnInit(): void {
    this.cargarPaquetes();
  }
  private crearNuevoPaquete(): Paquete {
    return {
      idPaquete: 0,
      nombre: '',
      destino: '',
      descripcion: '',
      precio: 0,
      duracionDias: 0,
      incluyeVuelo: false,
      incluyeHotel: false,
      activo: true
    };
  }

  cargarPaquetes(): void {
    this.paqueteService.buscarTodos().subscribe({
      next: (data) => {
        this.paquetes = data;

        // Obtener todos los destinos únicos
        this.destinosDisponibles = [...new Set(this.paquetes.map(p => p.destino))];

        this.aplicarFiltros();
      },
      error: (error) => console.error('Error al cargar paquetes:', error)
    });
  }

  pageNumbers(): number[] {
    const totalPages = this.totalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFiltrados / this.paquetesPorPagina));
  }
  cambiarPagina(nueva: number): void {
    const max = this.totalPages();
    if (nueva < 1 || nueva > max) return;
    this.paginaActual = nueva;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const filtrados = this.paquetes.filter(paquete => {
      const coincideBusqueda =
        !this.busqueda ||
        paquete.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        paquete.destino.toLowerCase().includes(this.busqueda.toLowerCase());
      const esActivo = !this.mostrarSoloActivos || paquete.activo;
      const coincideDestino = !this.destinoSeleccionado || paquete.destino === this.destinoSeleccionado;
      return coincideBusqueda && esActivo && coincideDestino;
    });
    this.totalFiltrados = filtrados.length;
    const i1 = (this.paginaActual - 1) * this.paquetesPorPagina;
    const i2 = this.paginaActual * this.paquetesPorPagina;
    this.paquetesFiltrados = filtrados.slice(i1, i2);
  }

  resetearFiltros(): void {
    this.busqueda = '';
    this.mostrarSoloActivos = false;
    this.destinoSeleccionado = '';
    this.paginaActual = 1;
    this.aplicarFiltros();
  }


  toggleActivo(paquete: Paquete): void {
    paquete.activo = !paquete.activo;
    this.paqueteService.modificar(paquete.idPaquete, paquete).subscribe({
      next: () => {
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al actualizar paquete:', error);
        paquete.activo = !paquete.activo;
      }
    });
  }




  eliminarPaquete(id: number): void {
    if (confirm('¿Está seguro de eliminar este paquete?')) {
      this.paqueteService.eliminar(id).subscribe({
        next: () => this.cargarPaquetes(),
        error: (error) => console.error('Error al eliminar paquete:', error)
      });
    }
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.nuevoPaquete = this.crearNuevoPaquete();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarPaquete(): void {
    this.paqueteService.alta(this.nuevoPaquete).subscribe({
      next: () => {
        this.cargarPaquetes();
        this.cerrarModal();
      },
      error: (error: any) => console.error('Error al guardar paquete:', error)
    });
  }

  abrirModalVer(paquete: Paquete): void {
    this.paqueteVer = paquete;
    this.mostrarModalVer = true;
  }

  cerrarModalVer(): void {
    this.mostrarModalVer = false;
    this.paqueteVer = null;
  }

  abrirModalEditar(paquete: Paquete): void {
    this.paqueteEditar = { ...paquete };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.paqueteEditar = null;
  }

  guardarEdicionPaquete(): void {
    if (this.paqueteEditar) {
      this.paqueteService.modificar(this.paqueteEditar.idPaquete, this.paqueteEditar).subscribe({
        next: () => {
          this.cargarPaquetes();
          this.cerrarModalEditar();
        },
        error: (error) => console.error('Error al editar paquete:', error)
      });
    }
  }

}


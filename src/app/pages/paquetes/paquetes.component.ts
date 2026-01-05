import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaqueteService } from '../../core/service/paquete.service';
import { Paquete } from '../../shared/interfaces/paquete';
import { Observable } from 'rxjs';
import { PaqueteActividadService } from '../../core/service/paqueteActividad.service';
import { PaqueteActividad } from '../../shared/interfaces/paqueteActividad';

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

  destinoSeleccionado: string = '';
  destinos: string[] = [];
  destinosDisponibles: string[] = [];

  mostrarModalVer = false;
  paqueteVer: Paquete | null = null;

  mostrarModalEditar = false;
  paqueteEditar: Paquete | null = null;

  // Modal editar/crear actividad
  mostrarModalActividad = false;
  actividadEdit: PaqueteActividad | null = null;
  isNuevaActividad = false;

  paginaActual = 1;
  paquetesPorPagina = 8;
  totalFiltrados = 0;

  // STEP 2
  stepActual = 1;
  actividades: PaqueteActividad[] = [];


  constructor(private paqueteService: PaqueteService,
    private paqueteActividad: PaqueteActividadService
  ) { }

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

  
  verActividadesDetalladas(): void {
    if (!this.paqueteVer) return;

    this.stepActual = 2;

    this.paqueteActividad
      .actividadesPorPaquete(this.paqueteVer.idPaquete)
      .subscribe({
        next: (data) => {
          this.actividades = data.sort((a, b) => a.dia - b.dia);
          console.log('Actividades cargadas:', this.actividades);
          console.log('Valores de imagen:', this.actividades.map(a => ({ titulo: a.titulo, imagen: a.imagen })));
        },
        error: (error) => {
          console.error('Error al cargar actividades:', error);
        }
      });
  }

  volverStep1(): void {
    this.stepActual = 1;
  }

  abrirModalNuevaActividad(): void {
    if (!this.paqueteVer) return;
    this.isNuevaActividad = true;
    this.actividadEdit = {
      id: 0,
      tipo: 'ACTIVIDAD',
      titulo: '',
      descripcion: '',
      horaInicio: '09:00',
      horaFin: '10:00',
      dia: 1,
      imagen: ''
    };
    this.mostrarModalActividad = true;
  }

  abrirModalEditarActividad(act: PaqueteActividad): void {
    this.isNuevaActividad = false;
    this.actividadEdit = { ...act };
    this.mostrarModalActividad = true;
  }

  cerrarModalActividad(): void {
    this.mostrarModalActividad = false;
    this.actividadEdit = null;
  }

  guardarActividad(): void {
    if (!this.paqueteVer || !this.actividadEdit) return;
    const idPaquete = this.paqueteVer.idPaquete;
    if (this.isNuevaActividad) {
      this.paqueteActividad.crear(this.actividadEdit, idPaquete).subscribe({
        next: (a) => {
          this.actividades.push(a);
          this.actividades.sort((x,y)=> x.dia - y.dia);
          this.cerrarModalActividad();
        },
        error: (e) => alert('Error al crear actividad')
      });
    } else {
      this.paqueteActividad.actualizar(this.actividadEdit.id, this.actividadEdit).subscribe({
        next: (a) => {
          const idx = this.actividades.findIndex(x=> x.id === a.id);
          if (idx !== -1) this.actividades[idx] = a;
          this.actividades.sort((x,y)=> x.dia - y.dia);
          this.cerrarModalActividad();
        },
        error: (e) => alert('Error al actualizar actividad')
      });
    }
  }

  eliminarActividad(act: PaqueteActividad): void {
    if (!confirm(`¿Eliminar actividad "${act.titulo}"?`)) return;
    this.paqueteActividad.eliminar(act.id).subscribe({
      next: () => {
        this.actividades = this.actividades.filter(a => a.id !== act.id);
      },
      error: () => alert('Error al eliminar actividad')
    });
  }


  cargarPaquetes(): void {
    this.paqueteService.buscarTodos().subscribe({
      next: (data: Paquete[]) => {
        this.paquetes = data;

        this.destinosDisponibles = [...new Set(this.paquetes.map(p => p.destino))];

        this.aplicarFiltros();
      },
      error: (error: any) => console.error('Error al cargar paquetes:', error)
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
      error: (error: any) => {
        console.error('Error al actualizar paquete:', error);
        paquete.activo = !paquete.activo;
      }
    });
  }




  eliminarPaquete(id: number): void {
    if (confirm('¿Está seguro de eliminar este paquete?')) {
      this.paqueteService.eliminar(id).subscribe({
        next: () => this.cargarPaquetes(),
        error: (error: any) => console.error('Error al eliminar paquete:', error)
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
    this.stepActual = 1; 
    this.actividades = []; 
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
        error: (error: any) => console.error('Error al editar paquete:', error)
      });
    }
  }


  getImagen(paquete: Paquete | null): string {
    if (!paquete) return 'assets/img/logoBlanco.png';

    const imgProp = (paquete as any).imagen;
    if (imgProp) {
      const file = imgProp.toString();
      return file.match(/\.(png|jpg|jpeg|webp|svg)$/i) ? `assets/img/${file}` : `assets/img/${file}.png`;
    }

    const available = new Set(['paris.png', 'roma.png', 'grecia.png', 'maldivas.png', 'logoBlanco.png']);

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

    const source = normalize((paquete.destino || paquete.nombre || '').toString());
    if (!source) return 'assets/img/logoBlanco.png';

    const tokens = source.split(/\s+/).filter(t => t.length > 0);

    for (const t of tokens) {
      const candidate = `${t}.png`;
      if (available.has(candidate)) return `assets/img/${candidate}`;
    }

    const joined = tokens.join('');
    for (const file of Array.from(available)) {
      if (joined.includes(file.replace(/\.png$/i, ''))) return `assets/img/${file}`;
    }

    return 'assets/img/logoBlanco.png';
  }

  getImagenActividad(actividad: PaqueteActividad | null): string {
    if (!actividad) return 'assets/img/actividades/default.png';

    const imagen = (actividad as any).imagen?.trim();
    if (imagen) {
      if (imagen.includes('assets/img/')) {
        return imagen;
      } else if (imagen.match(/\.(png|jpg|jpeg|webp|svg)$/i)) {
        return `assets/img/actividades/${imagen}`;
      } else {
        return `assets/img/actividades/${imagen}.png`;
      }
    }

    const descripcionNormalizada = (actividad.descripcion || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    if (descripcionNormalizada.includes('desayuno') || 
        descripcionNormalizada.includes('frances')) {
      return 'assets/img/actividades/desayuno-frances.jpg';
    }
    
    if (descripcionNormalizada.includes('tour') || 
        descripcionNormalizada.includes('guiado')) {
      return 'assets/img/actividades/tour-guiado.jpg';
    }
    
    if (descripcionNormalizada.includes('vuelo')) {
      return 'assets/img/actividades/vuelo-incluido.jpg';
    }
    return 'assets/img/actividades/default.png';
  }

  onImageError(event: any): void {
    const src = event.target.src;
    const actividadInfo = event.target.alt;
    console.error('❌ Error cargando imagen:', src);
    console.error('Actividad:', actividadInfo);
    event.target.src = 'assets/img/actividades/default.png';
  }

}


import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-private-layout',
  imports: [RouterModule, CommonModule, NavbarComponent, SidebarComponent],
  templateUrl: './private-layout.component.html',
  styleUrl: './private-layout.component.css'
})
export class PrivateLayoutComponent {
  sidebarAbierto = false;

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSidebar(): void {
    this.sidebarAbierto = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Cerrar sidebar automáticamente al cambiar a pantalla grande
    if (event.target.innerWidth > 768) {
      this.sidebarAbierto = false;
    }
  }
}

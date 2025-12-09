import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() abierto: boolean = false;
  @Output() cerrar = new EventEmitter<void>();

  onLinkClick(): void {
    // Cerrar sidebar en móvil al hacer clic en un enlace
    if (window.innerWidth <= 768) {
      this.cerrar.emit();
    }
  }
}

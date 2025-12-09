import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/service/AuthService';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  @Input() abierto: boolean = false;
  @Output() cerrar = new EventEmitter<void>();

  private authService = inject(AuthService);
  userRole!: string | null;

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
  }

  onLinkClick(): void {
    // Cerrar sidebar en móvil al hacer clic en un enlace
    if (window.innerWidth <= 768) {
      this.cerrar.emit();
    }
  }
}

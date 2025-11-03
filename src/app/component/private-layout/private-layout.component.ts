import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-private-layout',
  imports: [RouterModule, NavbarComponent, SidebarComponent],
  templateUrl: './private-layout.component.html',
  styleUrl: './private-layout.component.css',
  template: `
    <div class="layout">
      <app-sidebar></app-sidebar>
      <div class="main">
        <app-navbar></app-navbar>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class PrivateLayoutComponent {

}

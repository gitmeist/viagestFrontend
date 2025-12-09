  import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './shared/components/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './shared/components/private-layout/private-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { ReservaComponent } from './pages/reserva/reserva.component';
import { PagosComponent } from './pages/pagos/pagos.component';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { PaquetesComponent } from './pages/paquetes/paquetes.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
       { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent }
    ]
  },
  {
    path: '',
    component: PrivateLayoutComponent,
    canActivate: [authGuard], 
    children: [
      { path: 'home', component: HomeComponent },
      { 
        path: 'clientes', component: ClienteComponent, canActivate: [roleGuard], data: { roles: ['ADMON', 'AGENTE', 'EMPLEADO'] }
      },
      { 
        path: 'paquetes', component: PaquetesComponent, canActivate: [roleGuard], data: { roles: ['ADMON', 'AGENTE'] }
      },
      { 
        path: 'reservas', component: ReservaComponent, canActivate: [roleGuard], data: { roles: ['ADMON', 'AGENTE', 'EMPLEADO'] }
      },
      { 
        path: 'pagos', component: PagosComponent, canActivate: [roleGuard], data: { roles: ['ADMON', 'EMPLEADO'] }
      },
      { 
        path: 'settings', component: SettingsComponent, canActivate: [roleGuard], data: { roles: ['ADMON'] }
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];

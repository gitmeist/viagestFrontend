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
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'clientes', component: ClienteComponent },
      { path: 'paquetes', component: PaquetesComponent },
      { path: 'reservas', component: ReservaComponent },
      { path: 'pagos', component: PagosComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'home' }
];

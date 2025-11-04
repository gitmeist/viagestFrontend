  import { Routes } from '@angular/router';
  import { LoginComponent } from './pages/login/login.component';
  import { HomeComponent } from './pages/home/home.component';
  import { PublicLayoutComponent } from './component/public-layout/public-layout.component';
  import { PrivateLayoutComponent } from './component/private-layout/private-layout.component';
  import { ClienteComponent } from './pages/cliente/cliente.component';
  import { authGuard } from './guards/auth.guard'; 
import { ReservaComponent } from './pages/reserva/reserva.component';

  export const routes: Routes = [
    {
      path: '',
      component: PublicLayoutComponent,
      children: [
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
        { path: 'reservas', component: ReservaComponent }
      ]
    },
    { path: '**', redirectTo: 'home' }
  ];

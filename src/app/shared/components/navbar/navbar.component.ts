import { CommonModule} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/service/AuthService';



@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  username: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router  // 🔹 inyectamos Router aquí
  ) {
    const user = this.authService.getUser();
    this.username = user?.username || null;
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.username) {
      this.username = user.username;
    }
  }

  logout() {
  localStorage.removeItem('user');
  this.router.navigate(['login']); // ruta relativa a PublicLayout
}

}



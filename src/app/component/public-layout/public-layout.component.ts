import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [RouterModule],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css',
  template: `<router-outlet></router-outlet>`
})
export class PublicLayoutComponent {

}

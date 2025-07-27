import { Component } from '@angular/core';
import { BigmenuService } from './bigmenu/bigmenu.service';

@Component({
    selector: 'app-root',
    template: `
    <main>
      <app-header></app-header>
      <div class="main">
        <router-outlet></router-outlet>
        <app-spinner></app-spinner>
      </div>
    </main>
  `,
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  constructor(private menuservice: BigmenuService){}
}

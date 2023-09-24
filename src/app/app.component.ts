import { Component } from '@angular/core';

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
})
export class AppComponent {}

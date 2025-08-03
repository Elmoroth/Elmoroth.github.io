import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BigmenuService {
  // Reactive signal instead of Subject
  private toggleState = signal(false);

  // Expose as readonly if you don't want external modification
  readonly toggleState$ = this.toggleState.asReadonly();

  toggle() {
    this.toggleState.update(val => !val);
  }

  close() {
    this.toggleState.set(false);
  }
}
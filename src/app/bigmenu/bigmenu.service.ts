import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BigmenuService {
  /** Internal writable signal */
  private readonly isOpenState = signal<boolean>(false);

  /** Read-only signal exposed to components */
  readonly isOpen = this.isOpenState.asReadonly();

  /** Toggles menu state */
  toggle(): void {
    this.isOpenState.update((prev) => !prev);
  }

  /** Opens the menu */
  open(): void {
    this.isOpenState.set(true);
  }

  /** Closes the menu */
  close(): void {
    this.isOpenState.set(false);
  }
}
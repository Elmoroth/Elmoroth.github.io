import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private readonly _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  setLoading(isLoading: boolean): void {
    this._loading.set(isLoading);
  }
}
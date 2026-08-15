import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  readonly loader = inject(LoaderService);
}
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Species } from '../species/species';

@Component({
  standalone: true,
  selector: 'app-range',
  templateUrl: './range.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./range.component.css']
})
export class RangeComponent {

  @Input() speciesTree!: Species;

}

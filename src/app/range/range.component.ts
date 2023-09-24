import { Component, Input } from '@angular/core';
import { Species } from '../species/species';

@Component({
  standalone: true,
  selector: 'app-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.css']
})
export class RangeComponent {

  @Input() speciesTree!: Species;

}

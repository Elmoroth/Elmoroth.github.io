import { Component, Input } from '@angular/core';
import { Species } from '../species/species';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css']
})
export class CountComponent {

  @Input() speciesTree!: Species;

}

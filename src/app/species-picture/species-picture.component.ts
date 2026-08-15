import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Species } from '../species/species';

@Component({
  selector: 'app-species-picture',
  templateUrl: './species-picture.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./species-picture.component.css']
})
export class SpeciesPictureComponent {

  @Input() speciesTree!: Species;

}

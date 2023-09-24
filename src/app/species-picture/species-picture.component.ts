import { Component, Input } from '@angular/core';
import { Species } from '../species/species';
import { NgFor, NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-species-picture',
  templateUrl: './species-picture.component.html',
  styleUrls: ['./species-picture.component.css'],
  imports: [NgIf, NgFor]
})
export class SpeciesPictureComponent {

  @Input() speciesTree!: Species;

}

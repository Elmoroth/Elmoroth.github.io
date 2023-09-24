import { Component, Input } from '@angular/core';
import { Species } from '../species/species';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-speciesblock',
  templateUrl: './speciesblock.component.html',
  styleUrls: ['./speciesblock.component.css'],
  imports: [
    NgIf
  ]
})
export class SpeciesblockComponent {

  @Input() speciesTree!: Species;

}

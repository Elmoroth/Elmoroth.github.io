import { Component, Input } from '@angular/core';
import { Species } from '../species/species';
import { NgFor, NgIf } from '@angular/common';
import { SpeciesblockComponent } from '../speciesblock/speciesblock.component';

@Component({
  standalone: true,
  selector: 'app-genusblock',
  templateUrl: './genusblock.component.html',
  styleUrls: ['./genusblock.component.css'],
  imports: [
    SpeciesblockComponent, 
    NgFor, 
    NgIf
  ]
})
export class GenusblockComponent {

  @Input() speciesTree!: Species;

}

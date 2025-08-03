import { Component, Input } from '@angular/core';
import { Species } from '../species/species';
import { SpeciesblockComponent } from '../speciesblock/speciesblock.component';
import { CountComponent } from '../count/count.component';

@Component({
  selector: 'app-genusblock',
  templateUrl: './genusblock.component.html',
  styleUrls: ['./genusblock.component.css'],
  imports: [
    SpeciesblockComponent,
    CountComponent
  ]
})
export class GenusblockComponent {

  @Input() speciesTree!: Species;

}

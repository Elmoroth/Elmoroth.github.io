import { Component, Input } from '@angular/core';
import { Species } from '../species/species';
import { AsyncPipe, NgIf } from '@angular/common';
import { IucnComponent } from '../iucn/iucn.component';
import { SpeciesPictureComponent } from '../species-picture/species-picture.component';
import { RangeComponent } from '../range/range.component';
import { SpeciesInfoComponent } from '../species-info/species-info.component';

@Component({
    selector: 'app-speciesblock',
    templateUrl: './speciesblock.component.html',
    styleUrls: ['./speciesblock.component.css'],
    imports: [
        NgIf,
        IucnComponent,
        SpeciesPictureComponent,
        RangeComponent,
        SpeciesInfoComponent
    ]
})
export class SpeciesblockComponent {

  @Input() speciesTree!: Species;

  constructor() { }

}

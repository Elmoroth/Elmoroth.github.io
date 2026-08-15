import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { Species } from '../species/species';
import { IucnComponent } from '../iucn/iucn.component';
import { SpeciesPictureComponent } from '../species-picture/species-picture.component';
import { RangeComponent } from '../range/range.component';
import { SpeciesInfoComponent } from '../species-info/species-info.component';

@Component({
  selector: 'app-speciesblock',
  standalone: true,
  imports: [
    IucnComponent,
    SpeciesPictureComponent,
    RangeComponent,
    SpeciesInfoComponent,
  ],
  templateUrl: './speciesblock.component.html',
  styleUrls: ['./speciesblock.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesblockComponent {
  readonly speciesTree = input.required<Species>();

  /** Computes the direct Birds of the World URL for the species */
  readonly speciesUrl = computed(
    () => `${environment.birdsOfTheWorldUrl}/${this.speciesTree().ebirdCode}`
  );
}
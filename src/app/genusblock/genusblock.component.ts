import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { Species } from '../species/species';
import { SpeciesblockComponent } from '../speciesblock/speciesblock.component';
import { CountComponent } from '../count/count.component';

@Component({
  selector: 'app-genusblock',
  standalone: true,
  imports: [SpeciesblockComponent, CountComponent],
  templateUrl: './genusblock.component.html',
  styleUrls: ['./genusblock.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenusblockComponent {
  // Modern signal input
  readonly speciesTree = input.required<Species>();

  // Efficient computed signals replacing method re-evaluations in templates
  readonly hasDirectSpecies = computed(() =>
    this.speciesTree()?.children?.some((c) => c.rank === 'species') ?? false
  );

  readonly hasSubgenus = computed(() =>
    this.speciesTree()?.children?.some((c) => c.rank === 'subgenus') ?? false
  );
}
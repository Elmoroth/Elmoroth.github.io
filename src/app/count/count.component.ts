import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { Species } from '../species/species';

@Component({
  selector: 'app-count',
  standalone: true,
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountComponent {
  readonly speciesTree = input.required<Species>();

  readonly hasExtant = computed(() => (this.speciesTree()?.countExtant ?? 0) > 0);
  readonly hasExtinct = computed(() => (this.speciesTree()?.countExtinct ?? 0) > 0);
  readonly hasFossil = computed(() => (this.speciesTree()?.countFossil ?? 0) > 0);
}
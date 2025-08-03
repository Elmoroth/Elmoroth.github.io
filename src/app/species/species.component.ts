import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SpeciesService } from './species.service';
import { FamilyTreeService } from '../familytree/familytree.service';
import { SpeciestreeComponent } from '../speciestree/speciestree.component';
import { FamilyTreeComponent } from '../familytree/familytree.component';

@Component({
  selector: 'app-species',
  standalone: true,
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.css'],
  imports: [SpeciestreeComponent, FamilyTreeComponent, RouterModule],
})
export class SpeciesComponent {
  private route = inject(ActivatedRoute);
  private speciesService = inject(SpeciesService);
  private familyTreeService = inject(FamilyTreeService);

  // Step 1: Convert Observables to Signals
  private speciesSignal = toSignal(
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.speciesService.getSpeciesByMain(params.get('id')!)
      )
    ),
    { initialValue: null }
  );

  private partialTreeSignal = toSignal(
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.familyTreeService.getPartialTree(params.get('id')!)
      )
    ),
    { initialValue: null }
  );

  // Step 2: Use computed() to unwrap + non-null assert in one place
  readonly species = computed(() => this.speciesSignal()!);
  readonly partialtree = computed(() => this.partialTreeSignal()!);
}
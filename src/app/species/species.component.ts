import { 
  Component, 
  ChangeDetectionStrategy, 
  inject, 
  signal, 
  computed, 
  ElementRef, 
  OnDestroy,
  afterRenderEffect
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of, combineLatest, map } from 'rxjs';
import { SpeciesService, EpochFilters } from './species.service';
import { FamilyTreeService } from '../familytree/familytree.service';
import { SpeciestreeComponent } from '../speciestree/speciestree.component';
import { FamilyTreeComponent } from '../familytree/familytree.component';
import { Species } from './species';
import { FamilyTree } from '../familytree/familytree';

export type EpochKey = keyof EpochFilters['epochs'];

export const EPOCH_KEYS: EpochKey[] = [
  'cretaceous',
  'paleocene',
  'eocene',
  'oligocene',
  'miocene',
  'pliocene',
  'pleistocene',
  'holocene',
];

@Component({
  selector: 'app-species',
  standalone: true,
  imports: [
    SpeciestreeComponent, 
    FamilyTreeComponent, 
    RouterModule, 
    TitleCasePipe
  ],
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly speciesService = inject(SpeciesService);
  private readonly familyTreeService = inject(FamilyTreeService);
  private readonly elementRef = inject(ElementRef);

  readonly epochKeys = EPOCH_KEYS;

  private observer?: IntersectionObserver;
  private isProgrammaticScroll = false;
  private programmaticScrollTimeout?: ReturnType<typeof setTimeout>;
  private pendingCladeId: string | null = null;

  // UI State Signals
  readonly activeCladeId = signal<string | null>(null);
  readonly showTreeSidebar = signal<boolean>(true);
  readonly showFossils = signal<boolean>(true);
  readonly showEpochMenu = signal<boolean>(false);

  readonly epochFilters = signal<EpochFilters['epochs']>({
    cretaceous: false,
    paleocene: false,
    eocene: false,
    oligocene: false,
    miocene: false,
    pliocene: false,
    pleistocene: true,
    holocene: true,
  });

  readonly activeFilters = computed<EpochFilters>(() => ({
    showFossils: this.showFossils(),
    epochs: this.epochFilters(),
  }));

  // Route reactive signals
  readonly routeId$ = this.route.paramMap.pipe(
    map((params) => params.get('id'))
  );

  readonly currentFragment = toSignal(this.route.fragment, { initialValue: null });

  // Strictly typed data signals using toSignal
  readonly species = toSignal<Species | null>(
    combineLatest([this.routeId$, toObservable(this.activeFilters)]).pipe(
      switchMap(([id, filters]) =>
        id ? this.speciesService.getSpeciesByMain(id, filters) : of(null)
      )
    ),
    { initialValue: null }
  );

  readonly partialtree = toSignal<FamilyTree | null>(
    this.routeId$.pipe(
      switchMap((id) => (id ? this.familyTreeService.getPartialTree(id) : of(null)))
    ),
    { initialValue: null }
  );

  constructor() {
    afterRenderEffect(() => {
      const spData = this.species();
      const ptData = this.partialtree();
      const frag = this.currentFragment();

      if (spData && ptData) {
        this.setupScrollSync();

        const targetClade = frag || this.pendingCladeId;
        if (targetClade) {
          this.scrollToClade(targetClade);
          this.pendingCladeId = null;
        }
      }
    });
  }

  toggleTreeSidebar(): void {
    this.showTreeSidebar.update((visible) => !visible);
  }

  toggleFossils(): void {
    this.showFossils.update((show) => {
      if (show) this.showEpochMenu.set(false);
      return !show;
    });
  }

  toggleEpochMenu(): void {
    this.showEpochMenu.update((visible) => !visible);
  }

  toggleEpoch(epoch: EpochKey): void {
    this.epochFilters.update((state) => ({
      ...state,
      [epoch]: !state[epoch],
    }));
  }

  selectAllEpochs(selected: boolean): void {
    const updated = this.epochKeys.reduce((acc, key) => {
      acc[key] = selected;
      return acc;
    }, {} as EpochFilters['epochs']);

    this.epochFilters.set(updated);
  }

  private setupScrollSync(): void {
    this.observer?.disconnect();

    const targets = this.elementRef.nativeElement.querySelectorAll('[data-clade]');
    if (!targets.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (this.isProgrammaticScroll) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cladeId = entry.target.getAttribute('data-clade');
            if (cladeId && cladeId !== this.activeCladeId()) {
              this.activeCladeId.set(cladeId);
              this.scrollToSidebarNode(cladeId);
            }
          }
        });
      },
      {
        rootMargin: '-130px 0px -70% 0px',
        threshold: 0,
      }
    );

    targets.forEach((el: Element) => this.observer?.observe(el));
  }

  private scrollToSidebarNode(cladeId: string): void {
    const sidebarNode = this.elementRef.nativeElement.querySelector(
      `[data-tree-node="${cladeId}"]`
    );

    sidebarNode?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }

  onSidebarNodeClick(cladeId: string): void {
    const target = this.elementRef.nativeElement.querySelector(`[data-clade="${cladeId}"]`);
    if (target) {
      this.scrollToClade(cladeId);
    } else {
      this.pendingCladeId = cladeId;
    }
  }

  private scrollToClade(cladeId: string): void {
    const target = this.elementRef.nativeElement.querySelector(`[data-clade="${cladeId}"]`);
    if (!target) return;

    this.isProgrammaticScroll = true;
    this.activeCladeId.set(cladeId);

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    this.scrollToSidebarNode(cladeId);

    if (this.programmaticScrollTimeout) {
      clearTimeout(this.programmaticScrollTimeout);
    }

    this.programmaticScrollTimeout = setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, 700);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.programmaticScrollTimeout) {
      clearTimeout(this.programmaticScrollTimeout);
    }
  }
}
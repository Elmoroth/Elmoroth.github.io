import { 
  Component, 
  ChangeDetectionStrategy, 
  inject, 
  signal, 
  ElementRef, 
  OnDestroy,
  effect 
} from '@angular/core';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { SpeciesService } from './species.service';
import { FamilyTreeService } from '../familytree/familytree.service';
import { SpeciestreeComponent } from '../speciestree/speciestree.component';
import { FamilyTreeComponent } from '../familytree/familytree.component';

@Component({
  selector: 'app-species',
  standalone: true,
  imports: [SpeciestreeComponent, FamilyTreeComponent, RouterModule],
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly speciesService = inject(SpeciesService);
  private readonly familyTreeService = inject(FamilyTreeService);
  private readonly elementRef = inject(ElementRef);

  private observer?: IntersectionObserver;
  private isProgrammaticScroll = false;
  private programmaticScrollTimeout?: ReturnType<typeof setTimeout>;
  private pendingCladeId: string | null = null;

  readonly activeCladeId = signal<string | null>(null);
  readonly showTreeSidebar = signal<boolean>(true);

  private readonly routeId$ = this.route.paramMap.pipe(
    switchMap((params: ParamMap) => {
      const id = params.get('id');
      return id ? of(id) : of(null);
    })
  );

  // Capture URL fragments (e.g., #Turdinae)
  private readonly fragment$ = this.route.fragment;

  readonly species = toSignal(
    this.routeId$.pipe(
      switchMap((id) => (id ? this.speciesService.getSpeciesByMain(id) : of(null)))
    ),
    { initialValue: null }
  );

  readonly partialtree = toSignal(
    this.routeId$.pipe(
      switchMap((id) => (id ? this.familyTreeService.getPartialTree(id) : of(null)))
    ),
    { initialValue: null }
  );

  readonly currentFragment = toSignal(this.fragment$, { initialValue: null });

  constructor() {
    effect(() => {
      const spData = this.species();
      const ptData = this.partialtree();
      const frag = this.currentFragment();

      if (spData && ptData) {
        // Wait 2 macro-ticks (~100ms) for Angular & sub-components to complete DOM render
        setTimeout(() => {
          this.setupScrollSync();

          // If there's a pending scroll target or URL fragment, execute scroll now
          const targetClade = frag || this.pendingCladeId;
          if (targetClade) {
            this.scrollToClade(targetClade);
            this.pendingCladeId = null;
          }
        }, 100);
      }
    });
  }

  toggleTreeSidebar(): void {
    this.showTreeSidebar.update((visible) => !visible);
  }

  private setupScrollSync(): void {
    this.observer?.disconnect();

    const targets = this.elementRef.nativeElement.querySelectorAll('[data-clade]');
    if (!targets.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        // CRITICAL FIX: Ignore observer callbacks during programmatic scroll
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
        rootMargin: '-130px 0px -70% 0px', // Offset matches stacked header height (130px)
        threshold: 0,
      }
    );

    targets.forEach((el: Element) => this.observer?.observe(el));
  }

  private scrollToSidebarNode(cladeId: string): void {
    const sidebarNode = this.elementRef.nativeElement.querySelector(
      `[data-tree-node="${cladeId}"]`
    );

    if (sidebarNode) {
      sidebarNode.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest', // Keeps sidebar scrolling smooth without whole-page jumps
        inline: 'nearest',
      });
    }
  }

  onSidebarNodeClick(cladeId: string): void {
    const target = this.elementRef.nativeElement.querySelector(`[data-clade="${cladeId}"]`);

    if (target) {
      this.scrollToClade(cladeId);
    } else {
      // Store cladeId to execute scroll once signals update the DOM
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
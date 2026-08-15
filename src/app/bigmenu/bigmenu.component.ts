import { Component, ChangeDetectionStrategy, inject, ElementRef, HostListener } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { FamilyTreeService } from '../familytree/familytree.service';
import { BigmenuService } from './bigmenu.service';

@Component({
  selector: 'app-bigmenu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './bigmenu.component.html',
  styleUrls: ['./bigmenu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BigmenuComponent {
  private readonly elementRef = inject(ElementRef);
  private readonly familyTreeService = inject(FamilyTreeService);
  readonly menuService = inject(BigmenuService);

  readonly familyMenu = toSignal(
    this.familyTreeService.getFamilyMenu().pipe(
      catchError((err) => {
        console.error('Failed to load family menu', err);
        return of([]);
      })
    ),
    { initialValue: [] }
  );

  /** Listens for clicks anywhere in the document */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
    
    // If the click happened outside this component, close the menu
    if (!clickedInside) {
      this.menuService.close();
    }
  }
}
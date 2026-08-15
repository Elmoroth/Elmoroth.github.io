import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BigmenuComponent } from '../bigmenu/bigmenu.component';
import { BigmenuService } from '../bigmenu/bigmenu.service';
import { CountComponent } from '../count/count.component';
import { SpeciesService } from '../species/species.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, BigmenuComponent, CountComponent, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly speciesService = inject(SpeciesService);
  readonly menuService = inject(BigmenuService);

  readonly speciesTree$ = this.speciesService.getSpeciesByMain('Aves');
  readonly isMenuOpen = this.menuService.isOpen;

  toggleMenu(): void {
    this.menuService.toggle();
  }

  closeMenu(): void {
    this.menuService.close();
  }
}
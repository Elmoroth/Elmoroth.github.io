import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BigmenuComponent } from '../bigmenu/bigmenu.component';
import { SpeciesService } from '../species/species.service';
import { BigmenuService } from '../bigmenu/bigmenu.service';
import { AsyncPipe } from '@angular/common';
import { CountComponent } from '../count/count.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [RouterModule, BigmenuComponent, CountComponent, AsyncPipe],
})
export class HeaderComponent {
  speciesTree$ = this.speciesService.getSpeciesByMain('Aves');
  toggleState = this.menuservice.toggleState$; // this is a signal now

  constructor(
    public menuservice: BigmenuService,
    private speciesService: SpeciesService
  ) { }

  toggle() {
    this.menuservice.toggle();
  }

  closeMenu() {
    this.menuservice.close();
  }
}
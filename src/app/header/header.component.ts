import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BigmenuComponent } from '../bigmenu/bigmenu.component';
import { SpeciesService } from '../species/species.service';
import { Species } from '../species/species';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { BigmenuService } from '../bigmenu/bigmenu.service';
import { CountComponent } from '../count/count.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [RouterModule, BigmenuComponent, AsyncPipe, CountComponent]
})
export class HeaderComponent implements OnInit {
  speciesTree$!: Observable<Species>;

  constructor(
    public menuservice: BigmenuService,
    private speciesService: SpeciesService) {
    this.speciesTree$ = this.speciesService.getSpeciesByMain('Aves');
  }

  ngOnInit() {
  }

  toggle() {
    this.menuservice.toggle();
  }

  closeMenu() {
    this.menuservice.close();
  }

}

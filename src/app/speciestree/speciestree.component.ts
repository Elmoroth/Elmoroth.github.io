import { Component, Input } from '@angular/core';
import { Species } from '../species/species';
import { RouterModule } from '@angular/router';
import { GenusblockComponent } from '../genusblock/genusblock.component';
import { CountComponent } from '../count/count.component';

@Component({
  selector: 'app-speciestree',
  templateUrl: './speciestree.component.html',
  styleUrls: ['./speciestree.component.css'],
  imports: [
    RouterModule,
    GenusblockComponent,
    CountComponent
  ]
})
export class SpeciestreeComponent {

  @Input() speciesTree!: Species;

}


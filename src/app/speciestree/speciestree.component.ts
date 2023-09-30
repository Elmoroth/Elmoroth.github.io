import { Component, Input } from '@angular/core';
import { Species } from '../species/species';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GenusblockComponent } from '../genusblock/genusblock.component';
import { SpeciesblockComponent } from '../speciesblock/speciesblock.component';
import { CountComponent } from '../count/count.component';

@Component({
  standalone: true,
  selector: 'app-speciestree',
  templateUrl: './speciestree.component.html',
  styleUrls: ['./speciestree.component.css'],
  imports: [
    NgFor, 
    NgIf, 
    RouterModule, 
    NgSwitch, 
    NgSwitchCase, 
    NgSwitchDefault, 
    GenusblockComponent, 
    SpeciesblockComponent,
    CountComponent
  ]
})
export class SpeciestreeComponent {

  @Input() speciesTree!: Species;

}


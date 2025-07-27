import { Component, Input } from '@angular/core';
import { Species } from '../species/species';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GenusblockComponent } from '../genusblock/genusblock.component';
import { SpeciesblockComponent } from '../speciesblock/speciesblock.component';
import { CountComponent } from '../count/count.component';

@Component({
    selector: 'app-speciestree',
    templateUrl: './speciestree.component.html',
    styleUrls: ['./speciestree.component.css'],
    imports: [
        NgFor,
        NgIf,
        RouterModule,
        GenusblockComponent,
        CountComponent
    ]
})
export class SpeciestreeComponent {

  @Input() speciesTree!: Species;

}


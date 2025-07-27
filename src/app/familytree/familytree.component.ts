import { Component, Input } from '@angular/core';
import { FamilyTree } from './familytree';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-familytree',
    templateUrl: './familytree.component.html',
    styleUrls: ['./familytree.component.css'],
    imports: [NgFor, NgIf, RouterModule]
})

export class FamilyTreeComponent {

  @Input() familyTree!: FamilyTree;

}

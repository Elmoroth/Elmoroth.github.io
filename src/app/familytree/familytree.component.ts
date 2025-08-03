import { Component, Input } from '@angular/core';
import { FamilyTree } from './familytree';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-familytree',
  templateUrl: './familytree.component.html',
  styleUrls: ['./familytree.component.css'],
  imports: [RouterModule]
})

export class FamilyTreeComponent {

  @Input() familyTree!: FamilyTree;

}

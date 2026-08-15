import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FamilyTree } from './familytree';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-familytree',
  templateUrl: './familytree.component.html',
  styleUrls: ['./familytree.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterModule]
})

export class FamilyTreeComponent {

  @Input() familyTree!: FamilyTree;

}

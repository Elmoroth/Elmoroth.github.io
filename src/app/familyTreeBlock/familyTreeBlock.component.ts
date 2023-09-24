import { Component, OnInit } from '@angular/core';
import { FamilyTreeService } from '../familytree/familytree.service';
import { FamilyTree } from '../familytree/familytree';
import { FamilyTreeComponent } from '../familytree/familytree.component';
import { Observable } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-familyTreeBlock',
  templateUrl: './familyTreeBlock.component.html',
  styleUrls: ['./familyTreeBlock.component.css'],
  imports: [NgIf, AsyncPipe, FamilyTreeComponent]
})
export class FamilyTreeBlockComponent implements OnInit {
  familyTree$!: Observable<FamilyTree>;

  constructor(private service: FamilyTreeService) { }

  ngOnInit() {
    this.familyTree$ = this.service.getFamilies()
  }

}

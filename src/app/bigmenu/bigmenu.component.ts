import { Component, OnInit } from '@angular/core';
import { FamilyTreeService } from '../familytree/familytree.service';
import { Observable } from 'rxjs';
import { FamilyMenu } from '../familytree/familytree';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BigmenuService } from './bigmenu.service';

@Component({
  standalone: true,
  selector: 'app-bigmenu',
  templateUrl: './bigmenu.component.html',
  styleUrls: ['./bigmenu.component.css'],
  imports: [NgFor, NgIf, AsyncPipe, RouterModule]
})
export class BigmenuComponent implements OnInit {

  familyMenu$!: Observable<FamilyMenu[]>;

  constructor(private service: FamilyTreeService, private menuservice: BigmenuService) { }

  ngOnInit() {
    this.familyMenu$ = this.service.getFamilyMenu()
    this.familyMenu$.subscribe()
  }

  toggle() {
    this.menuservice.toggle();
  }

}

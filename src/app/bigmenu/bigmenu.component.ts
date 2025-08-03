import { Component, OnInit, signal } from '@angular/core';
import { FamilyTreeService } from '../familytree/familytree.service';
import { FamilyMenu } from '../familytree/familytree';
import { RouterModule } from '@angular/router';
import { BigmenuService } from './bigmenu.service';

@Component({
  selector: 'app-bigmenu',
  templateUrl: './bigmenu.component.html',
  styleUrls: ['./bigmenu.component.css'],
  imports: [RouterModule]
})
export class BigmenuComponent implements OnInit {
  familyMenu = signal<FamilyMenu[]>([]);

  constructor(
    private service: FamilyTreeService,
    private menuservice: BigmenuService
  ) { }

  ngOnInit() {
    this.service.getFamilyMenu().subscribe({
      next: (data) => this.familyMenu.set(data),
      error: (err) => {
        console.error('Failed to load family menu', err);
        this.familyMenu.set([]);
      }
    });
  }

  toggle() {
    this.menuservice.toggle();
  }
}

import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RouterModule } from '@angular/router';

import { Species } from './species';
import { SpeciesService } from './species.service';
import { SpeciestreeComponent } from '../speciestree/speciestree.component';

import { FamilyTreeService } from '../familytree/familytree.service';
import { FamilyTree } from '../familytree/familytree';
import { FamilyTreeComponent } from '../familytree/familytree.component';

@Component({
    selector: 'app-species',
    templateUrl: './species.component.html',
    styleUrls: ['./species.component.css'],
    imports: [NgIf, AsyncPipe, SpeciestreeComponent, FamilyTreeComponent, RouterModule]
})

export class SpeciesComponent implements OnInit {
  species$!: Observable<Species>;
  species!: Species;
  partialtree$!: Observable<FamilyTree>;
  partialtree!: FamilyTree;

  constructor(
    private _speciesservice: SpeciesService,
    private _familytreeservice: FamilyTreeService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.species$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this._speciesservice.getSpeciesByMain(params.get('id')!))
    );
    this.partialtree$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this._familytreeservice.getPartialTree(params.get('id')!))
    );
  }
}
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Species } from './species';
import { SpeciesService } from './species.service';
import { SpeciestreeComponent } from '../speciestree/speciestree.component';

@Component({
  standalone: true,
  selector: 'app-species',
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.css'],
  imports: [NgFor, NgIf, AsyncPipe, SpeciestreeComponent],
})

export class SpeciesComponent implements OnInit {
  species$!: Observable<Species>;
  species!: Species;

  constructor(
    private service: SpeciesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.species$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.service.getSpeciesByMain(params.get('id')!))
    );
  }
}
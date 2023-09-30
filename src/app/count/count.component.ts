import { Component, Input } from '@angular/core';
import { Species } from '../species/species';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css'],
  imports: [NgIf]
})
export class CountComponent {

  @Input() speciesTree!: Species;

}

import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-iucn',
  templateUrl: './iucn.component.html',
  styleUrls: ['./iucn.component.css']
})
export class IucnComponent {

  @Input() category!: string;

}

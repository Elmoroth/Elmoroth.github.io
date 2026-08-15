import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-iucn',
  templateUrl: './iucn.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./iucn.component.css']
})
export class IucnComponent {

  @Input() category!: string;

}

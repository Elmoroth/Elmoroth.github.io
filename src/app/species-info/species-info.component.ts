import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-species-info',
  templateUrl: './species-info.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./species-info.component.css']
})
export class SpeciesInfoComponent {

  @Input() info!: string;

}

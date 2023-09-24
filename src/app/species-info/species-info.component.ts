import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-species-info',
  templateUrl: './species-info.component.html',
  styleUrls: ['./species-info.component.css']
})
export class SpeciesInfoComponent {

  @Input() info!: string;

}

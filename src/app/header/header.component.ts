import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BigmenuComponent } from '../bigmenu/bigmenu.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { BigmenuService } from '../bigmenu/bigmenu.service';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [RouterModule, BigmenuComponent, NgIf, AsyncPipe]
})
export class HeaderComponent implements OnInit {

  constructor(public menuservice: BigmenuService) { }

  ngOnInit() {
  }

  toggle() {
    this.menuservice.toggle();
  }

  closeMenu() {
    this.menuservice.close();
  }

}

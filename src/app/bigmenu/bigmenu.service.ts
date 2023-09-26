import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class BigmenuService {

  constructor() { }

  private toggleState = new Subject();
  public toggleState$ = this.toggleState.asObservable();
  private toggleVal = false;

  toggle(){
    this.toggleVal = !this.toggleVal;
    this.toggleState.next(this.toggleVal);
  }
  close(){
    this.toggleVal = false;
    this.toggleState.next(this.toggleVal);
  }
}

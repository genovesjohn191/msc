import { Component } from '@angular/core';

@Component({
  selector: 'mfp-child',
  templateUrl: './child.component.html',
  styles: [ require('./child.component.scss')]
})

export class ChildComponent {

  public   title: string;      // Component Title

  public constructor () {
    this.title = 'Child component';
  }
}

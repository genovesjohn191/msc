import { Component } from '@angular/core';

@Component({
  selector: 'mcs-child',
  templateUrl: './child.component.html',
  styles: [require('./child.component.scss')]
})

export class ChildComponent {
  public title: string;

  public constructor() {
    this.title = 'Child component';
  }
}

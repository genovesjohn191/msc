import { Component } from '@angular/core';

@Component({
  selector: 'mcs-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})

export class ContentComponent {
  public title: string;

  public constructor() {
    this.title = 'Content component';
  }
}

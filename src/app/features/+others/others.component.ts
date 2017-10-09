import { Component } from '@angular/core';

@Component({
  selector: 'mcs-others',
  templateUrl: './others.component.html',
  styleUrls: ['./others.component.scss']
})

export class OthersComponent {
  public title: string;

  public constructor() {
    this.title = 'Others component (Lazy loaded)';
  }
}

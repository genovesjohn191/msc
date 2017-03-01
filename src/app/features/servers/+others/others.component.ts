import { Component } from '@angular/core';

@Component({
  selector: 'mfp-others',
  templateUrl: './others.component.html',
  styles: [require('./others.component.scss')]
})

export class OthersComponent {
  public title: string;

  public constructor() {
    this.title = 'Others component';
  }
}

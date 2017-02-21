import { Component } from '@angular/core';

@Component({
  selector: 'mfp-others',
  templateUrl: './others.component.html',
  styles: [ require('./others.component.scss')]
})

export class OthersComponent {

  public   Title: string;      // Component Title

  public constructor () {
    this.Title = 'Others component';
  }
}

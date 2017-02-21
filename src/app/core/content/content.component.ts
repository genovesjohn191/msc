import { Component } from '@angular/core';

@Component({
  selector: 'mfp-content',
  templateUrl: './content.component.html',
  styles: [ require('./content.component.scss')]
})

export class ContentComponent {

  public   Title: string;      // Component Title

  public constructor () {
    this.Title = 'Content component';
  }
}

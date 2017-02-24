import { Component } from '@angular/core';

@Component({
  selector: 'mfp-footer',
  templateUrl: './footer.component.html',
  styles: [ require('./footer.component.scss')]
})

export class FooterComponent {

  public   title: string;      // Component Title

  public constructor () {
    this.title = 'Footer component';
  }
}

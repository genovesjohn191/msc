import { Component } from '@angular/core';

@Component({
  selector: 'mfp-networking',
  templateUrl: './networking.component.html',
  styles: [ require('./networking.component.scss')]
})

export class NetworkingComponent {

  public   title: string;      // Component Title

  public constructor () {
    this.title = 'Networking component';
  }
}

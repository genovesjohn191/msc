import { Component } from '@angular/core';

@Component({
  selector: 'mfp-networking',
  templateUrl: './networking.component.html',
  styles: [ require('./networking.component.scss')]
})

export class NetworkingComponent {

  public   Title: string;      // Component Title

  public constructor () {
    this.Title = 'Networking component';
  }
}

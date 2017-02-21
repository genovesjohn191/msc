import { Component } from '@angular/core';

@Component({
  selector: 'mfp-servers',
  templateUrl: './servers.component.html',
  styles: [ require('./servers.component.scss')]
})

export class ServersComponent {

  public   Title: string;      // Component Title

  public constructor () {
    this.Title = 'Servers component';
  }
}

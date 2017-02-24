import { Component } from '@angular/core';

@Component({
  selector: 'mfp-servers',
  templateUrl: './servers.component.html',
  styles: [ require('./servers.component.scss')]
})

export class ServersComponent {

  public   title: string;      // Component Title

  public constructor () {
    this.title = 'Servers component';
  }
}

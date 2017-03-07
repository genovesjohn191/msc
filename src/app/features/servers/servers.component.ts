import { Component } from '@angular/core';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  styles: [require('./servers.component.scss')]
})

export class ServersComponent {
  public title: string;

  public constructor() {
    this.title = 'Servers component';
  }
}

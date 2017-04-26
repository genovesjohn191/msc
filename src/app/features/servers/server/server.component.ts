import {
  Component,
  OnInit
} from '@angular/core';

@Component({
  selector: 'mcs-server',
  styles: [require('./server.component.scss')],
  templateUrl: './server.component.html'
})
export class ServerComponent {
  public sidebar: string;
  public management: string;

  constructor() {
    this.sidebar = 'Sidebar Here';
    this.management = 'Management Here';
  }

}

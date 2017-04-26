import {
  Component,
  OnInit
} from '@angular/core';

@Component({
  selector: 'mcs-server-backups',
  styles: [require('./server-backups.component.scss')],
  templateUrl: './server-backups.component.html'
})
export class ServerBackupsComponent {
  public title: string;

  constructor() {
    this.title = 'Server Backups';
  }

}

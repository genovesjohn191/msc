import {
  Component
} from '@angular/core';

@Component({
  selector: 'mcs-server-backups',
  styleUrls: ['./server-backups.component.scss'],
  templateUrl: './server-backups.component.html'
})
export class ServerBackupsComponent {
  public title: string;

  constructor() {
    this.title = 'Server Backups';
  }

}

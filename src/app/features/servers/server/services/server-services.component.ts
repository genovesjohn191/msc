import {
  Component
} from '@angular/core';

@Component({
  selector: 'mcs-server-services',
  styleUrls: ['./server-services.component.scss'],
  templateUrl: './server-services.component.html'
})
export class ServerServicesComponent {
  public title: string;

  constructor() {
    this.title = 'Server Services';
  }

}

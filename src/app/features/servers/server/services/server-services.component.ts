import {
  Component
} from '@angular/core';

@Component({
  selector: 'mcs-server-services',
  templateUrl: './server-services.component.html'
})
export class ServerServicesComponent {
  public title: string;

  constructor() {
    this.title = 'Server Services';
  }

}

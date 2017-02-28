import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';

// Services Declarations
import {
  EnvironmentProvider,
  FusionApiHttpClientService
} from '../../core';

@Component({
  selector: 'mfp-networking',
  templateUrl: './networking.component.html',
  styles: [require('./networking.component.scss')]
})

export class NetworkingComponent {

  public title: string;      // Component Title
  public environment: string;
  public host: string;

  public constructor(private _envProvider: EnvironmentProvider) {
    this.title = 'Networking component';
    this.environment = _envProvider.environment;
    this.host = _envProvider.host;
  }
}

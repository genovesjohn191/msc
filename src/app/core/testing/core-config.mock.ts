import { Injectable } from '@angular/core';
import { McsNotificationConfig } from '../models/mcs-notification-config';

@Injectable()
export class MockCoreConfig {

  public apiHost: string = 'http://localhost:5000/api';

  public imageRoot: string = 'assets/img/';

  public iconRoot: string = 'assets/icon/';

  public notification: McsNotificationConfig = {
    host: 'ws://localhost:15674/ws',
    password: '*****',
    routePrefix: '',
    user: 'F500120501'
  };
}

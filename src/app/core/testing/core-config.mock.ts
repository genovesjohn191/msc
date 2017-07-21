import { Injectable } from '@angular/core';

@Injectable()
export class MockCoreConfig {

  public apiHost: string = 'http://localhost:5000/api';

  public imageRoot: string = 'assets/img/';

  public iconRoot: string = 'assets/icon/';
}

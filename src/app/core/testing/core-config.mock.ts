import { Injectable } from '@angular/core';

@Injectable()
export class MockCoreConfig {

  /**
   * `@Important:` Do not set the value of this apiHost
   * in order for us not to call the getFullUrl of apiService when
   * calling the expectOne method of httpMock.
   */
  public apiHost: string = '';

  public imageRoot: string = 'assets/img/';

  public iconRoot: string = 'assets/icon/';

  public loginUrl: string = '#';

  public logoutUrl: string = '#';
}

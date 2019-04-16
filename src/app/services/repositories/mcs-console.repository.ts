import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsRepositoryBase } from '@app/core';
import { getSafeProperty } from '@app/utilities';
import { McsConsole } from '@app/models';
import {
  McsApiClientFactory,
  McsApiConsoleFactory,
  IMcsApiConsoleService
} from '@app/api-client';
import { McsConsoleDataContext } from '../data-context/mcs-console-data.context';

@Injectable()
export class McsConsoleRepository extends McsRepositoryBase<McsConsole> {
  private readonly _consoleApiService: IMcsApiConsoleService;

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsConsoleDataContext(
      _apiClientFactory.getService(new McsApiConsoleFactory())
    ));
    this._consoleApiService = _apiClientFactory.getService(new McsApiConsoleFactory());
  }

  /**
   * Gets the server console of the server
   * @param serverId Server id of the server to get from
   */
  public getServerConsole(serverId: string): Observable<McsConsole> {
    return this._consoleApiService.getServerConsole(serverId).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }
}

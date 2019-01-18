import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsRepositoryBase } from '@app/core';
import { getSafeProperty } from '@app/utilities';
import { McsConsole } from '@app/models';
import { McsConsoleDataContext } from '../data-context/mcs-console-data.context';
import { ConsoleApiService } from '../api-services/console-api.service';

@Injectable()
export class McsConsoleRepository extends McsRepositoryBase<McsConsole> {

  constructor(private _consoleApiService: ConsoleApiService) {
    super(new McsConsoleDataContext(_consoleApiService));
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

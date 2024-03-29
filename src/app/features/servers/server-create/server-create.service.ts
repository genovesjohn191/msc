import { Injectable } from '@angular/core';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  tap,
  catchError
} from 'rxjs/operators';
import {
  McsOrderBase,
  IMcsJobManager,
  IMcsFallible,
  IMcsStateChangeable
} from '@app/core';
import {
  McsServerCreate,
  McsJob,
  McsServerClone,
  DataStatus,
  OrderIdType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';

@Injectable()
export class ServerCreateService extends McsOrderBase
  implements IMcsJobManager, IMcsFallible, IMcsStateChangeable {

  constructor(private _apiService: McsApiService) {
    super(_apiService, OrderIdType.CreateManagedServer);
  }

  /**
   * Creates the self managed server based on the server details provided
   * @param serverModel Server details to be created
   */
  public createSelfManagedServer(serverModel: McsServerCreate | McsServerClone): void {
    if (isNullOrEmpty(serverModel)) { return; }

    let serverInstance = serverModel instanceof McsServerCreate ?
      this._createNewSelfManageServer(serverModel) :
      this._createCloneSelfManagedServer(serverModel);

    this.setChangeState(DataStatus.Active);
    serverInstance.pipe(
      tap((response) => {
        this.setChangeState(DataStatus.Success);
        this.setJobs(response);
      }),
      catchError((httpError) => {
        this.setChangeState(DataStatus.Error);

        let errorMessages = getSafeProperty(httpError, (obj) => obj.details.errorMessages, []);
        this.setErrors(...errorMessages);
        return throwError(httpError);
      })
    ).subscribe();
  }

  /**
   * Creates new server based on server input
   * @param serverInput Server input based on the form data
   */
  private _createNewSelfManageServer(serverCreateModel: McsServerCreate): Observable<McsJob> {
    if (isNullOrEmpty(serverCreateModel)) { return; }
    return this._apiService.createServer(serverCreateModel);
  }

  /**
   * Clones a server based on server input
   * @param serverCloneModel Server input based on the form data
   */
  private _createCloneSelfManagedServer(serverCloneModel: McsServerClone): Observable<McsJob> {
    if (isNullOrEmpty(serverCloneModel)) { return; }
    return this._apiService.cloneServer(serverCloneModel.serverId, serverCloneModel);
  }
}

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
  CoreRoutes,
  IMcsJobManager,
  IMcsFallible,
  IMcsStateChangeable
} from '@app/core';
import {
  McsServerCreate,
  McsJob,
  McsServerClone,
  RouteKey,
  DataStatus,
  McsServerCreateAddOnSqlServer,
  McsServerCreateAddOnInview
} from '@app/models';
import {
  McsOrdersRepository,
  McsServersRepository
} from '@app/services';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';

@Injectable()
export class ServerCreateService extends McsOrderBase
  implements IMcsJobManager, IMcsFallible, IMcsStateChangeable {

  constructor(
    _ordersRepository: McsOrdersRepository,
    private _serversRepository: McsServersRepository
  ) {
    super(_ordersRepository);
  }

  /**
   * Creates the self managed server based on the server details provided
   * @param serverModel Server details to be created
   */
  public createSelfManagedServer(serverModel: McsServerCreate | McsServerClone): void {
    if (isNullOrEmpty(serverModel)) { return; }

    serverModel.clientReferenceObject.resourcePath =
      CoreRoutes.getNavigationPath(RouteKey.ServerDetail);

    let serverInstance = serverModel instanceof McsServerCreate ?
      this._createNewSelfManageServer(serverModel) :
      this._createCloneSelfManagedServer(serverModel);

    this.setChangeState(DataStatus.InProgress);
    serverInstance.pipe(
      tap((response) => {
        this.setChangeState(DataStatus.Success);
        this.setJobs(response);
      }),
      catchError((httpError) => {
        this.setChangeState(DataStatus.Error);
        this.setErrors(...httpError.errorMessages);
        return throwError(httpError);
      })
    ).subscribe();
  }

  /**
   * Sets the sql server add on to the created order
   * @param sql Sql server to be set
   */
  public setSqlServerAddOn(sql: McsServerCreateAddOnSqlServer): void {
    let mainOrder = getSafeProperty(this.order, (obj) => obj.items[0]);
    if (isNullOrEmpty(mainOrder)) {
      throw new Error(`Main order was not yet created.`);
    }
    mainOrder.properties['sqlServer'] = sql.sqlServer;
    this.addOrUpdateOrderItem(mainOrder);
  }

  /**
   * Sets the inview level to the created order
   * @param inview Inview level to be set
   */
  public setInviewAddOn(inview: McsServerCreateAddOnInview): void {
    let mainOrder = getSafeProperty(this.order, (obj) => obj.items[0]);
    if (isNullOrEmpty(mainOrder)) {
      throw new Error(`Main order was not yet created.`);
    }
    mainOrder.properties['inview'] = inview.inviewLevel;
    this.addOrUpdateOrderItem(mainOrder);
  }

  /**
   * Creates new server based on server input
   * @param serverInput Server input based on the form data
   */
  private _createNewSelfManageServer(serverCreateModel: McsServerCreate): Observable<McsJob> {
    if (isNullOrEmpty(serverCreateModel)) { return; }
    return this._serversRepository.createServer(serverCreateModel);
  }

  /**
   * Clones a server based on server input
   * @param serverCloneModel Server input based on the form data
   */
  private _createCloneSelfManagedServer(serverCloneModel: McsServerClone): Observable<McsJob> {
    if (isNullOrEmpty(serverCloneModel)) { return; }
    return this._serversRepository.cloneServer(
      serverCloneModel.clientReferenceObject.serverId, serverCloneModel
    );
  }
}

import { Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { isNullOrEmpty } from '@app/utilities';
import {
  ServerServicesAction,
  McsServer
} from '@app/models';
import { IServerServiceActionStrategy } from './server-service-action.strategy';
import { serverServicesActionMap } from './server-service-action.map';

export type ServerServiceActionDetail = {
  action: ServerServicesAction,
  server: McsServer,
  payload?: any
};

export class ServerServiceActionContext {
  private _eventStrategy: IServerServiceActionStrategy<any>;
  private _serviceActionDetail: ServerServiceActionDetail;

  constructor(private _injector: Injector) { }

  public setActionStrategyByType(serviceActionDetail: ServerServiceActionDetail): void {
    let eventStrategy = serverServicesActionMap[serviceActionDetail.action];
    if (isNullOrEmpty(eventStrategy)) {
      throw new Error(`Unable to find strategy for type ${serviceActionDetail.action}.
        Please make sure you've registered the type in the action map`);
    }
    this._eventStrategy = eventStrategy;
    this._serviceActionDetail = serviceActionDetail;
  }

  public executeAction<T>(): Observable<T> {
    this._eventStrategy.setInjector(this._injector);
    return this._eventStrategy.executeEvent(this._serviceActionDetail);
  }
}

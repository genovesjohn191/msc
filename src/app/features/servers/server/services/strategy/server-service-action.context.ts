import { Injector } from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  ServerServicesAction,
  McsServer
} from '@app/models';
import { IServerServiceActionStrategy } from './server-service-action.strategy';
import { serverServicesActionMap } from './server-service-action.map';

export type ServerServiceActionDetail = {
  action: ServerServicesAction,
  server: McsServer
};

export class ServerServiceActionContext {
  private _eventStrategy: IServerServiceActionStrategy;
  private _currentServer: McsServer;

  constructor(private _injector: Injector) { }

  public setActionStrategyByType(serviceActionDetail: ServerServiceActionDetail): void {
    let eventStrategy = serverServicesActionMap[serviceActionDetail.action];
    if (isNullOrEmpty(eventStrategy)) {
      throw new Error(`Unable to find strategy for type ${serviceActionDetail.action}.
        Please make sure you've registered the type in the event map`);
    }
    this._eventStrategy = eventStrategy;
    this._currentServer = serviceActionDetail.server;
  }

  public executeAction(): void {
    this._eventStrategy.setInjector(this._injector);
    this._eventStrategy.executeEvent(this._currentServer);
  }
}

import { Injector } from '@angular/core';
import { McsServer } from '@app/models';
import { IServerServiceActionStrategy } from '../server-service-action.strategy';

export class ServiceOsUpdateInspectAction implements IServerServiceActionStrategy {

  public setInjector(_injector: Injector): void { }

  public executeEvent(_server: McsServer): void {
    // TODO: event to execute
  }
}

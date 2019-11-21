import { Injector } from '@angular/core';
import { IServerServiceActionStrategy } from '../server-service-action.strategy';
import { ServerServiceActionDetail } from '../server-service-action.context';

export class ServiceOsUpdatesScheduleDeleteAction implements IServerServiceActionStrategy {


  public setInjector(_injector: Injector): void {
    // TODO: put injectors here
  }

  public executeEvent(_serviceActionDetail: ServerServiceActionDetail): void {
    // TODO: extract and put the save code here
  }
}

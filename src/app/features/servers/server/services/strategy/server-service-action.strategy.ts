import { Injector } from '@angular/core';
import { ServerServiceActionDetail } from './server-service-action.context';

export interface IServerServiceActionStrategy {
  setInjector(injector: Injector): void;
  executeEvent(serviceActionDetail: ServerServiceActionDetail): void;
}

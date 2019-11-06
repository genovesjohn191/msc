import { Injector } from '@angular/core';
import { McsServer } from '@app/models';

export interface IServerServiceActionStrategy {
  setInjector(injector: Injector): void;
  executeEvent(server: McsServer): void;
}

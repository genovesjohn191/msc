import { Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerServiceActionDetail } from './server-service-action.context';

export interface IServerServiceActionStrategy<T> {
  setInjector(injector: Injector): void;
  executeEvent(serviceActionDetail: ServerServiceActionDetail): Observable<T>;
}

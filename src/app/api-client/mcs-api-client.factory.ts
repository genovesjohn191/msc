import {
  Injectable,
  Injector
} from '@angular/core';
import { McsApiEntityFactory } from './factory/mcs-api-entity.factory';

@Injectable()
export class McsApiClientFactory {

  constructor(private _injector: Injector) { }

  /**
   * Gets the service factory instance
   * @param factory Factory to get the service instance
   */
  public getService<T>(factory: McsApiEntityFactory<T>): T {
    return this._injector.get(factory.getServiceInstance());
  }
}

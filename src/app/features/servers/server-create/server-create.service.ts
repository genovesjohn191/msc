import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrdersService } from '../../orders';
import {
  Resource,
  ResourcesRepository,
  ResourceServiceType
} from '../../resources';
import { McsAccessControlService } from '../../../core';

@Injectable()
export class ServerCreateService {
  constructor(
    _ordersService: OrdersService,
    private _accessControlService: McsAccessControlService,
    private _resourcesRepository: ResourcesRepository
  ) { }

  /**
   * Returns the resources applicable to create server (Filtered based on feature flag)
   */
  public getCreationResources(): Observable<Resource[]> {
    return this._resourcesRepository.findAllRecords()
      .pipe(
        map((resources) => {
          let managedFeatureIsOn = this._accessControlService
            .hasAccessToFeature('enableCreateManagedServer');
          return resources.filter((resource) => {
            return resource.serviceType === ResourceServiceType.SelfManaged ||
              (managedFeatureIsOn && resource.serviceType === ResourceServiceType.Managed);
          });
        })
      );
  }
}

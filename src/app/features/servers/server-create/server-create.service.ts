import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsAccessControlService,
  CoreDefinition
} from '@app/core';
import {
  ServiceType,
  McsResource
} from '@app/models';
import { OrdersService } from '@app/features/orders';
import { ResourcesRepository } from '@app/features/resources';

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
  public getCreationResources(): Observable<McsResource[]> {
    return this._resourcesRepository.findAllRecords()
      .pipe(
        map((resources) => {
          let managedFeatureIsOn = this._accessControlService
            .hasAccessToFeature(CoreDefinition.FEATURE_FLAG_ENABLE_CREATE_MANAGED_SERVER);
          return resources.filter((resource) => {
            return resource.serviceType === ServiceType.SelfManaged ||
              (managedFeatureIsOn && resource.serviceType === ServiceType.Managed);
          });
        })
      );
  }
}

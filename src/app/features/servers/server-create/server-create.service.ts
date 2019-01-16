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
import { McsResourcesRepository } from '@app/services';

@Injectable()
export class ServerCreateService {
  constructor(
    private _accessControlService: McsAccessControlService,
    private _resourcesRepository: McsResourcesRepository
  ) { }

  /**
   * Returns the resources applicable to create server (Filtered based on feature flag)
   * @deprecated Used the findResourcesbyFeature method of Resources Repository instead
   */
  public getCreationResources(): Observable<McsResource[]> {
    return this._resourcesRepository.getAll()
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

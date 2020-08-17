import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsResource,
  ServiceType,
  McsPermission,
  McsFeatureFlag
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsAccessControlService } from '@app/core';

@Injectable()
export class ServersService {

  constructor(
    private _accessControlService: McsAccessControlService,
    private _apiService: McsApiService
  ) { }

  /**
   * Get all the resources based on the access control
   * @note OrderEdit and EnableOrderingManagedServerCreate
   */
  public getResourcesByAccess(): Observable<McsResource[]> {
    return this._apiService.getResources().pipe(
      map((resources) => {
        let managedResourceIsOn = this._accessControlService.hasAccess(
          [McsPermission.OrderEdit], [McsFeatureFlag.Ordering, McsFeatureFlag.OrderingManagedServerCreate], true, true);

        return resources && resources.collection.filter(
          (resource) => resource.serviceType === ServiceType.SelfManaged ||
            (managedResourceIsOn && resource.serviceType === ServiceType.Managed)
        );
      })
    );
  }
}

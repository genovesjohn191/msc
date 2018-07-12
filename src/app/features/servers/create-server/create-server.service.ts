import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsAccessControlService } from '../../../core';
import {
  Resource,
  ResourcesRepository,
  ResourceServiceType
} from '../../resources';

@Injectable()
export class CreateServerService {

  constructor(
    private _accessControlService: McsAccessControlService,
    private _resourcesRepository: ResourcesRepository
  ) { }

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

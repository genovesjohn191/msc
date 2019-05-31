import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsServer,
  McsResource,
  ServiceType
} from '@app/models';
import { McsResourcesRepository } from '@app/services';
import {
  McsAccessControlService,
  CoreDefinition
} from '@app/core';

/**
 * @deprecated Set the server spinner in the api-service instead.
 */
@Injectable()
export class ServersService {

  constructor(
    private _accessControlService: McsAccessControlService,
    private _resourcesRepository: McsResourcesRepository
  ) { }

  /**
   * Get all the resources based on the access control
   * @note OrderEdit and EnableOrderingManagedServerCreate
   */
  public getResourcesByAccess(): Observable<McsResource[]> {
    return this._resourcesRepository.getAll().pipe(
      map((resources) => {
        let managedResourceIsOn = this._accessControlService.hasAccess(
          ['OrderEdit'], CoreDefinition.FEATURE_FLAG_ENABLE_CREATE_MANAGED_SERVER);

        return resources.filter(
          (resource) => resource.serviceType === ServiceType.SelfManaged ||
            (managedResourceIsOn && resource.serviceType === ServiceType.Managed)
        );
      })
    );
  }

  /**
   * Set the server status to inprogress to display the spinner of corresponding server
   * @param server Server to be set as processing
   * @param classes Additional classed to set their isProcessing flag
   */
  public setServerSpinner(server: McsServer, ...classes: any[]): void {
    this._setServerExecutionStatus(server, true, ...classes);
  }

  /**
   * Clear the server status to hide the spinner of corresponding server
   * @param server Server to be set as processing
   * @param classes Additional classed to set their isProcessing flag
   */
  public clearServerSpinner(server: McsServer, ...classes: any[]): void {
    this._setServerExecutionStatus(server, false, ...classes);
  }

  /**
   * Set the server execution based on status in order for the
   * server to load first while waiting for the corresponding job
   * @param server Server to be set as processing
   * @param classes Additional classed to set their isProcessing flag
   */
  private _setServerExecutionStatus(
    server: McsServer,
    status: boolean = true,
    ...classes: any[]
  ): void {
    if (isNullOrEmpty(server)) { return; }
    server.isProcessing = status;
    server.processingText = 'Processing request.';

    // Additional instance to set the process flag
    if (!isNullOrEmpty(classes)) {
      classes.forEach((param) => {
        if (isNullOrEmpty(param)) {
          param = Object.create(param);
          param.isProcessing = status;
        } else {
          param.isProcessing = status;
        }
      });
    }
  }
}

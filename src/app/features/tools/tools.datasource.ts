import {
  Observable,
  Subject
} from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CoreConfig,
  McsDataSource,
  McsDataStatus
} from '../../core';
import {
  Portal,
  PortalAccess
} from './models';
import { ToolsRepository } from './tools.repository';

export class ToolsDataSource implements McsDataSource<Portal> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  constructor(
    private _coreConfig: CoreConfig,
    private _toolsRepository: ToolsRepository
  ) { }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<Portal[]> {
    this.dataLoadingStream.next(McsDataStatus.InProgress);
    return this._toolsRepository.findAllRecords(undefined, undefined)
      .pipe(
        map((portals) => {
          let partnerPortals: Portal[] = [];
          let otherServices: Portal[] = [];

          // Add Macquarie View
          let macquarieView = new Portal();
          macquarieView.name = 'Macquarie View';
          let macquarieViewPortalAccess = new PortalAccess();
          macquarieViewPortalAccess.name = macquarieView.name;
          macquarieViewPortalAccess.url = this._coreConfig.macviewUrl;
          macquarieView.portalAccess = Array(macquarieViewPortalAccess);
          partnerPortals.push(macquarieView);

          // Map portals to respective locations
          for (let portal of portals) {
            portal.resourceSpecific
              ? partnerPortals.push(portal)
              : otherServices.push(portal);
          }

          portals = partnerPortals;

          return portals;
        })
      );
  }

  /**
   * Destroy all objects from the current connection
   * and return all the record to its original value
   */
  public disconnect() {
    // Release resources
  }

  /**
   * This will invoke when the data obtainment is completed
   * @param portals Data to be provided when the datasource is connected
   */
  public onCompletion(_status: McsDataStatus): void {
    // Execute all data from completion
  }
}

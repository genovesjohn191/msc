import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsDataStatus
} from '../../core';
import { Portal } from './portal';
import { ToolsService } from './tools.service';
import { isNullOrEmpty } from '../../utilities';

export class ToolsDataSource implements McsDataSource<Portal> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  /**
   * It will populate the data when the obtainment is completed
   */
  private _totalRecordCount: number;
  public get totalRecordCount(): number {
    return this._totalRecordCount;
  }
  public set totalRecordCount(value: number) {
    this._totalRecordCount = value;
  }

  constructor(
    private _toolsService: ToolsService
  ) {
    this._totalRecordCount = 0;
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<Portal[]> {
    this.dataLoadingStream.next(McsDataStatus.InProgress);
    return this._toolsService.getPortals()
      .map((response) => {
        this._totalRecordCount = response.totalCount;

        // Remove all portals without resource
        for (let portal of response.content) {
          if (isNullOrEmpty(portal.resource)) {
            let index = response.content.indexOf(portal, 0);
            response.content.splice(index, 1);
          }
        }

        return response.content;
      });
  }

  /**
   * Destroy all objects from the current connection
   * and return all the record to its original value
   */
  public disconnect() {
    this._totalRecordCount = 0;
  }

  /**
   * This will invoke when the data obtainment is completed
   * @param portals Data to be provided when the datasource is connected
   */
  public onCompletion(status: McsDataStatus, portals?: Portal[]): void {
    // Execute all data from completion
  }
}

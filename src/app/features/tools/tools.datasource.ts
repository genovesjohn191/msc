import { Observable } from 'rxjs/Rx';
import { McsDataSource } from '../../core';
import { Portal } from './portal';
import { ToolsService } from './tools.service';

export class ToolsDataSource implements McsDataSource<Portal> {
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
    return this._toolsService.getPortals()
    .map((response) => {
      this._totalRecordCount = response.totalCount;
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
  public onCompletion(portals?: Portal[]): void {
    // Execute all data from completion
  }

  /**
   * This will invoke when the data obtainment process encountered error
   * @param status Status of the error
   */
  public onError(status?: number): void {
    // Display the error template in the UI
  }
}

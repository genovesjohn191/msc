import { Observable } from 'rxjs/Rx';
import { McsDataSource } from '../../core';
import { Portal } from './portal';
import { PortalsService } from './portals.service';

export class PortalsDataSource implements McsDataSource<Portal> {
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
    private _portalsService: PortalsService
  ) {
    this._totalRecordCount = 0;
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<Portal[]> {
    return this._portalsService.getPortals()
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
}

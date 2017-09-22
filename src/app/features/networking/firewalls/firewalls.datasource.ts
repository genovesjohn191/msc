import { Observable } from 'rxjs/Rx';
import {
  McsDataSource,
  McsPaginator,
  McsSearch
} from '../../../core';
import { Firewall } from './models';
import { FirewallsService } from './firewalls.service';

export class FirewallsDataSource implements McsDataSource<Firewall> {
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

  /**
   * Flag if the datasource connect has successfully obtained from API
   */
  private _successfullyObtained: boolean;
  public get successfullyObtained(): boolean {
    return this._successfullyObtained;
  }
  public set successfullyObtained(value: boolean) {
    this._successfullyObtained = value;
  }

  constructor(
    private _firewallsService: FirewallsService,
    private _paginator: McsPaginator,
    private _search: McsSearch
  ) {
    this._totalRecordCount = 0;
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<Firewall[]> {
    const displayDataChanges = [
      Observable.of(undefined), // Add undefined observable to make way of retry when error occured
      this._paginator.pageChangedStream,
      this._search.searchChangedStream,
    ];

    return Observable.merge(...displayDataChanges)
      .switchMap(() => {
        let displayedRecords = this._paginator.pageSize * (this._paginator.pageIndex + 1);

        return this._firewallsService.getFirewalls(
          this._paginator.pageIndex,
          displayedRecords,
          this._search.keyword
        ).map((response) => {
          this._totalRecordCount = response.totalCount;
          return response.content;
        });
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
   * @param firewalls Data to be provided when the datasource is connected
   */
  public onCompletion(firewalls?: Firewall[]): void {
    // Execute all data from completion
    this._paginator.pageCompleted();
    this._successfullyObtained = true;
  }

  /**
   * This will invoke when the data obtainment process encountered error
   * @param status Status of the error
   */
  public onError(status?: number): void {
    // Display the error template in the UI
    this._paginator.pageCompleted();
    this._successfullyObtained = false;
  }
}

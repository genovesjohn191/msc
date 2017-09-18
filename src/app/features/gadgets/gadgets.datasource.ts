import { McsDataSource } from '../../core';
import {
  Observable,
  Subject,
  BehaviorSubject
} from 'rxjs/Rx';
import {
  McsPaginator,
  McsSearch
} from '../../core';
import {
  GadgetsDatabase,
  UserData
} from './gadgets.database';

export class GadgetsDataSource implements McsDataSource<any> {
  private _filterChange = new BehaviorSubject('');
  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this._filterChange.next(filter); }

  constructor(
    private _exampleDatabase: GadgetsDatabase,
    private _paginator: McsPaginator,
    private _search: McsSearch
  ) { }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<UserData[]> {
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._paginator.pageChangedStream,
      this._search.searchChangedStream,
    ];

    return Observable.merge(...displayDataChanges)
      .map(() => {
        // Get all record by page settings
        let pageData = this._exampleDatabase.data.slice();
        let endIndex = (this._paginator.pageIndex + 1) * this._paginator.pageSize;

        // Get all record by filter settings and return them
        let actualData = pageData.splice(0, endIndex);
        return actualData.slice().filter((item: UserData) => {
          let searchStr = (item.name + item.color).toLowerCase();
          return searchStr.indexOf(this._search.keyword.toLowerCase()) !== -1;
        });
      });
  }

  public disconnect() {
    // Disconnect all resources
  }

  public onCompletion(): void {
    // Add delay to see the loader on the paginator
    setTimeout(() => {
      this._paginator.pageCompleted();
    }, 3000);
  }

  /**
   * This will invoke when the data obtainment process encountered error
   * @param status Status of the error
   */
  public onError(status?: number): void {
    // Display the error template in the UI
  }
}

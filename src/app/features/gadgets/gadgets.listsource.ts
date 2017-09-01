import { McsDataSource } from '../../core';
import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
import { McsPaginator } from '../../core';
import {
  GadgetsDatabase,
  UserData
} from './gadgets.database';

export class GadgetsListSource implements McsDataSource<UserData> {
  private _filterChange = new BehaviorSubject('');
  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this._filterChange.next(filter); }

  constructor(
    private _exampleDatabase: GadgetsDatabase,
    private _paginator: McsPaginator
  ) {
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<UserData[]> {
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
    ];

    return Observable.merge(...displayDataChanges)
      .map(() => {
        return this._exampleDatabase.data;
      });
  }

  public disconnect() {
    // Disconnect all resources
  }

  public onCompletion(): void {
    // Do all the completion of pagination, filtering, etc... here
  }
}

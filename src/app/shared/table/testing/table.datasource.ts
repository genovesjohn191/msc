
import { Observable } from 'rxjs/Rx';
import { McsDataSource } from '../../../core';
import { TableUserData } from './table-userdata';

export class TableDatasource implements McsDataSource<any> {
  public loading: boolean;

  constructor() {
    this.loading = false;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<TableUserData[]> {
    let users: TableUserData[] = new Array();
    this.loading = true;
    users.push({ name: 'Arrian', userId: '12345' } as TableUserData);
    users.push({ name: 'Fairbanks', userId: '12346' } as TableUserData);
    users.push({ name: 'Pascual', userId: '12347' } as TableUserData);

    return Observable.of<TableUserData[]>(users);
  }

  public disconnect() {
    // Disconnect all resources
  }

  public onCompletion(): void {
    this.loading = false;
  }

  /**
   * This will invoke when the data obtainment process encountered error
   * @param status Status of the error
   */
  public onError(status?: number): void {
    // Display the error template in the UI
  }
}

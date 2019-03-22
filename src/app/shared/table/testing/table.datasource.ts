import {
  Observable,
  of
} from 'rxjs';
import { McsDataSource } from '../mcs-data-source.interface';
import { TableUserData } from './table-userdata';
import { DataStatus } from '@app/models';

export class TableDatasource implements McsDataSource<any> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
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

    return of<TableUserData[]>(users);
  }

  public disconnect() {
    // Disconnect all resources
  }

  public onCompletion(): void {
    this.loading = false;
  }

  public dataStatusChange(): Observable<DataStatus> {
    return of(DataStatus.Success);
  }
}

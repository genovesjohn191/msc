import {
  of,
  Observable
} from 'rxjs';

import { DataStatus } from '@app/models';
import { McsDataSource } from '@app/utilities';

import { ListPanelUserData } from './list-panel-userdata';

export class ListPanelDatasource implements McsDataSource<any> {
  public loading: boolean;

  constructor() {
    this.loading = false;
  }

  public connect(): Observable<ListPanelUserData[]> {
    let users: ListPanelUserData[] = new Array();
    this.loading = true;
    users.push({ name: 'TestData', userId: '12345' } as ListPanelUserData);
    users.push({ name: 'TestData2', userId: '12346' } as ListPanelUserData);
    users.push({ name: 'TestData3', userId: '12347' } as ListPanelUserData);

    return of<ListPanelUserData[]>(users);
  }

  public disconnect() {
  }

  public refreshDataRecords(): void {
  }

  public onCompletion(): void {
    this.loading = false;
  }

  public dataStatusChange(): Observable<DataStatus> {
    return of(DataStatus.Success);
  }
}


import { Observable } from 'rxjs/Rx';
import { McsDataSource } from '../../../core';
import { UserData } from './userdata';

export class ListPanelDatasource implements McsDataSource<any> {
  public loading: boolean;

  constructor() {
    this.loading = false;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<UserData[]> {
    let users: UserData[] = new Array();
    this.loading = true;
    users.push({ name: 'Arrian', userId: '12345', color: 'green' } as UserData);
    users.push({ name: 'Fairbanks', userId: '12346', color: 'yellow' } as UserData);
    users.push({ name: 'Pascual', userId: '12347', color: 'blue' } as UserData);
    users.push({ name: 'Sample', userId: '12348', color: 'green' } as UserData);

    return Observable.of<UserData[]>(users);
  }

  public disconnect() {
    // Disconnect all resources
  }

  public onCompletion(): void {
    this.loading = false;
  }
}

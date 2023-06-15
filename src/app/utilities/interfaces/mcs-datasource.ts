import { Observable } from 'rxjs';

import { DataSource } from '@angular/cdk/table';
import { DataStatus } from '@app/models';

export interface McsDataSource<T> extends DataSource<T> {
  onCompletion(data?: T[]): void;
  dataStatusChange(): Observable<DataStatus>;
  refreshDataRecords(): void;
  isSearching(): boolean;
}

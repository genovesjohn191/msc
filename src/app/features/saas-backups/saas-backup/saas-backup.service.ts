import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { McsStorageSaasBackup } from '@app/models';

@Injectable()
export class SaasBackupService {
  private _detailsChange = new BehaviorSubject<McsStorageSaasBackup>(null);

  public getSaasBackupId(): string {
    return this._detailsChange.getValue().id;
  }

  public getSaasBackup(): Observable<McsStorageSaasBackup> {
    return this._detailsChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public setSaasBackup(data: McsStorageSaasBackup): void {
    this._detailsChange.next(data);
  }
}
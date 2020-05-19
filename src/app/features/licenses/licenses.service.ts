import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { McsLicense } from '@app/models';

@Injectable()
export class LicensesService {
  private _licenses = new BehaviorSubject<McsLicense[]>(null);

  /**
   * Returns the licenses list as an observable
   */
  public getLicenses(): Observable<McsLicense[]> {
    return this._licenses.asObservable().pipe(
      distinctUntilChanged()
    );
  }
}

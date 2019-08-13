import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  distinctUntilChanged,
  filter
} from 'rxjs/operators';
import { McsInternetPort } from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';

@Injectable()
export class InternetPortService {
  private _selectedInternetPortChange: BehaviorSubject<McsInternetPort>;

  constructor() {
    this._selectedInternetPortChange = new BehaviorSubject<McsInternetPort>(undefined);
  }

  /**
   * Event that emits when the selected item has been changed
   */
  public selectedInternetPortChange(): Observable<McsInternetPort> {
    return this._selectedInternetPortChange.pipe(
      distinctUntilChanged(),
      filter((internetPort) => !isNullOrEmpty(internetPort))
    );
  }

  /**
   * Sets the selected internet port and notify it's event subscribers
   * @param internetPort internet port to be selected
   */
  public setSelectedInternetPort(internetPort: McsInternetPort): void {
    this._selectedInternetPortChange.next(internetPort);
  }

  /**
   * Returns the internet port id
   */
  public getInternetPortId(): string {
    return getSafeProperty(this._selectedInternetPortChange.getValue(), (obj) => obj.id);
  }
}

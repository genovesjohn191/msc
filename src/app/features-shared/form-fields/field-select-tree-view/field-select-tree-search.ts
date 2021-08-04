import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  tap
} from 'rxjs/operators';

import { AbstractControl } from '@angular/forms';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  McsSearch
} from '@app/utilities';

export class FieldSelectTreeSearch implements McsSearch {
  public keyword: string;
  public searchChangedStream: Subject<McsSearch>;
  public searching: boolean;

  private _formControl: AbstractControl;
  private _destroySubject = new Subject<void>();

  constructor() {
    this.searchChangedStream = new Subject();
  }

  public registerFormControl(formControl: AbstractControl): FieldSelectTreeSearch {
    this._formControl = formControl;
    return this;
  }

  public startSubscription(): void {
    this._validateFormControl();
    this._subscribeToValueChange();
  }

  public stopSubscription(): void {
    unsubscribeSafely(this._destroySubject);
  };

  public showLoading(showLoading: boolean): void {
    this.searching = showLoading;
  }

  private _subscribeToValueChange(): void {
    this._formControl.valueChanges.pipe(
      takeUntil(this._destroySubject),
      debounceTime(200),
      distinctUntilChanged(),
      tap(value => {
        this.keyword = value;
        this._notifySearchKeywordChange();
      })
    ).subscribe();
  }

  private _notifySearchKeywordChange() {
    this.searchChangedStream.next(this);
  }

  private _validateFormControl(): void {
    if (isNullOrEmpty(this._formControl)) {
      throw new Error('Unable to start the subcription when no form registered.');
    }
  }
}

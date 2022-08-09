import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { McsNotice } from '@app/models';

@Injectable()
export class NoticeDetailsService {
  private _detailsChange = new BehaviorSubject<McsNotice>(null);

  public getNoticeId(): string {
    return this._detailsChange.getValue().id;
  }

  public getNoticeDetails(): Observable<McsNotice> {
    return this._detailsChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public setNoticeDetails(data: McsNotice): void {
    this._detailsChange.next(data);
  }
}
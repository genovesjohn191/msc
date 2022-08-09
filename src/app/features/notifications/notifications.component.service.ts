import { BehaviorSubject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable()
export class NotificationsService {
  private _activitiesTotalCountChange = new BehaviorSubject<number>(undefined);
  private _noticesTotalCountChange = new BehaviorSubject<number>(undefined);

  public getActivitiesTotalCount(): number {
    return this._activitiesTotalCountChange.getValue();
  }

  public setActivitiesTotalCount(count: number): void {
    this._activitiesTotalCountChange.next(count);
  }

  public getNoticesTotalCount(): number {
    return this._noticesTotalCountChange.getValue();
  }

  public setNoticesTotalCount(count: number): void {
    this._noticesTotalCountChange.next(count);
  }
}
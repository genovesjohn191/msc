import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { McsPlannedWork } from '@app/models';

@Injectable()
export class PlannedWorkDetailsService {
  private _detailsChange = new BehaviorSubject<McsPlannedWork>(null);

  public getPlannedWorkId(): string {
    return this._detailsChange.getValue().id;
  }

  public getPlannedWorkDetails(): Observable<McsPlannedWork> {
    return this._detailsChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public setPlannedWorkDetails(data: McsPlannedWork): void {
    this._detailsChange.next(data);
  }

  public getPlannedWorkIcsFileName(): string {
    return `planned_work_${this._detailsChange.getValue().referenceId}`;
  }
}
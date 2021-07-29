import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { McsObjectProject } from '@app/models';

@Injectable()
export class DashboardProjectService {
  private _dashboardProjectDetails = new BehaviorSubject<McsObjectProject>(null);
  private _dashboardProjectNumber: string;

  public getDashboardProjectDetails(): Observable<McsObjectProject> {
    return this._dashboardProjectDetails.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public setDashboardProjectDetails(dashboardProjectDetails: McsObjectProject): void {
    this.setDashboardProjectId(dashboardProjectDetails.id);
    this._dashboardProjectDetails.next(dashboardProjectDetails);
  }

  public setDashboardProjectId(id: string): void {
    this._dashboardProjectNumber = id;
  }

  public getDashboardProjectId(): string {
    return this._dashboardProjectNumber;
  }
}

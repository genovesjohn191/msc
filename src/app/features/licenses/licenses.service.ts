import { Injectable } from '@angular/core';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  Subscription,
  Observable,
  BehaviorSubject
} from 'rxjs';
import {
  McsNotificationContextService,
  McsAccessControlService
} from '@app/core';
import {
  McsJob
} from '@app/models';
import {
  isNullOrEmpty,
  addOrUpdateArrayRecord,
  McsDisposable,
  unsubscribeSafely
} from '@app/utilities';
import { McsEvent } from '@app/events';

@Injectable()
export class LicenseService implements McsDisposable {
  private _licenseJobs: McsJob[] = [];
  private _licenseJobsChange = new BehaviorSubject<McsJob[]>([]);
  private _currentUserJobHandler: Subscription;

  constructor(
    _accessControlService: McsAccessControlService,
    private _eventDispatcher: EventBusDispatcherService,
  ) {
    this._registerEvents();
  }

  public dispose() {
    unsubscribeSafely(this._currentUserJobHandler);
  }

  /**
   * An observable event that emits when a license count has been change
   */
  public licenseJobsChange(): Observable<McsJob[]> {
    return this._licenseJobsChange.asObservable();
  }

  /**
   * Registers the events
   */
  private _registerEvents(): void {
    this._currentUserJobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobMsLicenseCountChangeEvent, this._onCurrentUserJob.bind(this));

    this._eventDispatcher.dispatch(McsEvent.jobMsLicenseCountChangeEvent);
  }

  /**
   * Event that emits when the current user license job has been received
   */
  private _onCurrentUserJob(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }

    this._licenseJobs = addOrUpdateArrayRecord(
      this._licenseJobs,
      job,
      false,
      (_existingJob: McsJob) => {
        return _existingJob.id === job.id;
      });
    this._notifyLicensesChanges();
  }

  /**
   * Notifies the license changes
   */
  private _notifyLicensesChanges(): void {
    this._licenseJobsChange.next(this._licenseJobs);
  }
}
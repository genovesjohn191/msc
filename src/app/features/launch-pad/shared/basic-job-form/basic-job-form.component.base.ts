import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatVerticalStepper } from '@angular/material/stepper';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IMcsNavigateAwayGuard } from '@app/core';
import {
  DynamicFormComponent,
  DynamicFormFieldConfigBase
} from '@app/features-shared/dynamic-form';
import { CommonDefinition, isNullOrEmpty, unsubscribeSafely } from '@app/utilities';
import { JobStatus, McsJob, RouteKey } from '@app/models';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';

export interface BasicFormConfig {
  title: string;
  inProgressMessage: string;
  failedSendingRequestMessage: string;
  submitButtonText: string;

  successful: {
    title: string;

    newObjectLink: {
      id: string;
      text: string;
      eventTracker: string;
      eventCategory: string;
      eventLabel: string;
    }
  };
}

@Component({ template: '' })
export abstract class BasicJobFormComponentBase<TPayload> implements IMcsNavigateAwayGuard, OnDestroy {
  @ViewChild('form')
  public form: DynamicFormComponent;

  @ViewChild('stepper')
  protected stepper: MatVerticalStepper;

  public abstract settings: BasicFormConfig;

  public abstract formConfig: DynamicFormFieldConfigBase[];

  public processing: boolean = false;
  public hasError: boolean = false;
  public creationSuccessful: boolean = false
  public routerLinkSettings: any[];
  public successMessage: string;
  public watchedJob: McsJob;

  public get isValidPayload(): boolean {
    return this.form && this.form.valid;
  }

  public get successIconKey(): string {
    return CommonDefinition.ASSETS_SVG_SUCCESS;
  }
  private _jobEventHandler: Subscription;

  public constructor(private _changeDetector: ChangeDetectorRef, private _eventDispatcher: EventBusDispatcherService) { }

  public ngOnDestroy() {
    unsubscribeSafely(this._jobEventHandler);
  }

  public abstract formatPayload(form: DynamicFormComponent): TPayload;

  public abstract send(payload: TPayload): Observable<McsJob>;

  public abstract getNewObjectRouterLinkSettings(newObject: McsJob): any[];

  public abstract getSuccessMessage(newObject: McsJob): string;

  public submit(): void {
    this.hasError = false;
    this.processing = true;

    this.send(this.formatPayload(this.form))
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;

      this._changeDetector.markForCheck();

      return throwError('Network creation endpoint failed.');
    }))
    .subscribe((response: McsJob) => {
      this._watchThisJob(response);
    });
  }

  public getNotificationRoute(): any[] {
    return [RouteKey.Notification, this.watchedJob];
  }

  public retry(): void {
    this.hasError = false;
    this.processing = false;
    this._changeDetector.markForCheck();
  }

  public canNavigateAway(): boolean {
    return !this.form.form.valid;
  }

  private _watchThisJob(job: McsJob): void {
    this.watchedJob = job;
    this._jobEventHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobReceive, this._onJobUpdatesReceived.bind(this));
  }

  private _onJobUpdatesReceived(job: McsJob): void {
    let watchedJob = !isNullOrEmpty(job) && job.id === this.watchedJob.id;
    if (!watchedJob)  { return; }

    this.watchedJob = job;

    // Successful
    if (job.status === JobStatus.Completed) {
      this.hasError = false;
      this.processing = false;
      this.creationSuccessful = true;

      this.routerLinkSettings = this.getNewObjectRouterLinkSettings(job);
      this.successMessage = this.getSuccessMessage(job);
      this._changeDetector.markForCheck();
      this.stepper.selected.completed = true;
      this.stepper.next();
    }
    // Failed
    else if (job.status > JobStatus.Completed) {
      this.hasError = true;
      this.processing = false;
      this._changeDetector.markForCheck();
    }

  }
}
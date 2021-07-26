import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  DynamicFormComponent,
  DynamicFormFieldConfigBase
} from '@app/features-shared/dynamic-form';
import {
  compareJsons,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import {
  DataStatus,
  McsJob,
  RouteKey
} from '@app/models';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';

export interface UneditableField {
  label: string;
  value: any;
  fallbackText?: string;
  type: string;
}

export interface BasicFormConfig {
  title: string;
  panelHeader: string;
  inProgressMessage: string;
  failedSendingRequestMessage: string;
  submitButtonText: string;
}

@Component({ template: '' })
export abstract class BasicJobEditComponentBase<TPayload> implements OnDestroy, AfterViewInit {
  @ViewChild('form')
  public form: DynamicFormComponent;
  public unchangedPayload: TPayload;
  public uneditableFields: UneditableField[];

  public abstract settings: BasicFormConfig;

  public abstract formConfig: DynamicFormFieldConfigBase[];

  public processing: boolean = false;
  public hasError: boolean = false;
  public watchedJob: McsJob;

  private _jobEventHandler: Subscription;

  public get isValidPayload(): boolean {
    return this.form && this.form.valid && this.isDirty;
  }

  public constructor(
    private _changeDetector: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService
    ) { }

  public ngAfterViewInit(): void {
    this.setFormValues();
    this.setUnchangedPayload();
    this.uneditableFields = this.getUneditableFields();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._jobEventHandler);
  }

  public abstract setFormValues(): void;

  public abstract formatPayload(form: DynamicFormComponent): TPayload;

  public abstract send(payload: TPayload): Observable<McsJob>;

  public abstract onJobComplete(job: McsJob): void;

  public abstract getUneditableFields(): UneditableField[];

  public submit(): void {
    this.hasError = false;
    this.processing = true;

    this.send(this.formatPayload(this.form))
      .pipe(catchError(() => {
        this.hasError = true;
        this.processing = false;

        this._changeDetector.markForCheck();

        return throwError('Update endpoint failed.');
      }))
      .subscribe((response: McsJob) => {
        this._watchThisJob(response);
      });
  }

  public getNotificationRoute(): any[] {
    return [RouteKey.Notification, this.watchedJob.id];
  }

  public retry(): void {
    this.hasError = false;
    this.processing = false;
    this._changeDetector.markForCheck();
  }

  private get isDirty(): boolean {
    return compareJsons(this.formatPayload(this.form), this.unchangedPayload) !== 0;
  }

  private _watchThisJob(job: McsJob): void {
    this.watchedJob = job;
    this._jobEventHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobReceive, this._onJobUpdatesReceived.bind(this));
  }

  private _onJobUpdatesReceived(job: McsJob): void {
    let watchedJob = !isNullOrEmpty(job) && job.id === this.watchedJob.id;
    if (!watchedJob) { return; }

    this.watchedJob = job;

    // Failed
    if (job.dataStatus === DataStatus.Error) {
      this.hasError = true;
      this.processing = false;
      this._changeDetector.markForCheck();
      return;
    }

    // Successful
    if (job.dataStatus === DataStatus.Success) {
      this.hasError = false;
      this.processing = false;

      this._changeDetector.markForCheck();
      this.onJobComplete(job);
    }
  }

  public setUnchangedPayload(): void {
    this.unchangedPayload = this.formatPayload(this.form);
  }
}
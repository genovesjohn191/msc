import {
  throwError,
  Observable,
  Subscription
} from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { IMcsNavigateAwayGuard } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { DynamicFormComponent } from '@app/features-shared/dynamic-form';
import {
  DataStatus,
  McsJob,
  McsMultiJobFormConfig,
  RouteKey
} from '@app/models';
import {
  createObject,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

import { MultiJobFormTask } from './multi-job-form-task';

export interface MultiFormConfig {
  header: string;
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
export abstract class MultiJobFormComponentBase<TPayload> implements IMcsNavigateAwayGuard, OnDestroy {
  @ViewChildren('form')
  public form: QueryList<DynamicFormComponent>;

  @ViewChild('stepper')
  protected stepper: MatStepper;

  public abstract settings: MultiFormConfig;

  public multiFormItems: McsMultiJobFormConfig[] = [];
  public taskList: MultiJobFormTask[] = [];
  public routerLinkSettings: any[];
  public successMessage: string;
  public watchedJob: McsJob;

  public processing: boolean = false;
  public hasError: boolean = false;
  public creationSuccessful: boolean = false
  public panelOpenState: boolean = false;

  private _jobEventHandler: Subscription;

  public constructor(
    private _changeDetector: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _eventDispatcher: EventBusDispatcherService) {
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._jobEventHandler);
  }

  public get isValidPayload(): boolean {
    let hasInvalidForm = this.form?.find((forms) => !forms.valid);
    this._checkFormValidity();
    return this.form && isNullOrEmpty(hasInvalidForm);
  }

  public get hasMultipleItems(): boolean {
    return this.multiFormItems?.length > 1;
  }

  public openPanelByDefault(index: number): boolean {
    return index === 0;
  }

  public get successIconKey(): string {
    return CommonDefinition.ASSETS_SVG_SUCCESS;
  }

  public abstract formatPayload(form: QueryList<DynamicFormComponent>): TPayload;

  public abstract send(payload: TPayload): Observable<McsJob>;

  public abstract getNewObjectRouterLinkSettings(refId: string): any[];

  public abstract getSuccessMessage(name: string): string;

  public abstract addItem(item?: McsMultiJobFormConfig, event?: PointerEvent): void;

  public abstract deleteItem(index: number, event?: PointerEvent): void;

  public abstract onDataChange(item: McsMultiJobFormConfig, event: any): void;

  public panelOpened(): void {
    this.panelOpenState = true;
  }

  public panelClosed(): void {
    this.panelOpenState = false;
  }

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
    return [RouteKey.Notification, this.watchedJob.id];
  }

  public retry(): void {
    this.hasError = false;
    this.processing = false;
    this._changeDetector.markForCheck();
  }

  public canNavigateAway(): boolean {
    return !this.form?.filter((config => !config.valid));
  }

  private _checkFormValidity(): void {
    let nodeList = this._elementRef?.nativeElement?.querySelectorAll('form.ng-dirty.ng-touched');
    for (let i = 0; i < nodeList.length; i++) {
      if (nodeList[i].classList.contains('ng-invalid')) {
        nodeList[i].parentElement.closest('.mat-expansion-panel').classList.add('invalid-form');
      } else  {
        nodeList[i].parentElement.closest('.mat-expansion-panel').classList.remove('invalid-form');
      }
    }
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
      this.creationSuccessful = true;
      job.tasks?.forEach((task) => {
        this.taskList.push(createObject(MultiJobFormTask, {
          routerLinkSettings: this.getNewObjectRouterLinkSettings(task.referenceObject.id),
          successMessage: this.getSuccessMessage(task.referenceObject.name)
        }));
      });
      this._changeDetector.markForCheck();
      this.stepper.selected.completed = true;
      this.stepper.next();
    }
  }
}
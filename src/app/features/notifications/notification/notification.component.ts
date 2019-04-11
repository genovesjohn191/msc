import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subject,
  Observable
} from 'rxjs';
import {
  takeUntil,
  shareReplay
} from 'rxjs/operators';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsJob } from '@app/models';
import {
  CoreDefinition,
  CoreEvent
} from '@app/core';
import { McsJobsRepository } from '@app/services';
import { unsubscribeSafely } from '@app/utilities';

@Component({
  selector: 'mcs-notification',
  templateUrl: './notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationComponent implements OnInit, OnDestroy {
  public job$: Observable<McsJob>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _jobsRepository: McsJobsRepository
  ) { }

  public ngOnInit() {
    this._subscribeToJobsDataChange();
    this._subscribeToParamId();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get dotIconKey(): string {
    return CoreDefinition.ASSETS_FONT_BULLET;
  }

  /**
   * Subscribes to parameter id
   */
  private _subscribeToParamId(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject)
    ).subscribe((params: ParamMap) => {
      let jobId = params.get('id');
      this._subscribeToJobById(jobId);
    });
  }

  /**
   * Subscribes to job based on the parameter ID
   */
  private _subscribeToJobById(jobId: string): void {
    this._eventDispatcher.dispatch(CoreEvent.loaderShow);

    this.job$ = this._jobsRepository.getByIdAsync(
      jobId, this._onJobObtained.bind(this)
    ).pipe(shareReplay());
  }

  /**
   * Subscribes to jobs data change
   */
  private _subscribeToJobsDataChange(): void {
    this._jobsRepository.dataChange().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }

  /**
   * Event that emits when the job obtained
   */
  private _onJobObtained(): void {
    this._eventDispatcher.dispatch(CoreEvent.loaderHide);
  }
}
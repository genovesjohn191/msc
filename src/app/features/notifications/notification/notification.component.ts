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
  shareReplay,
  finalize
} from 'rxjs/operators';
import { McsJob } from '@app/models';
import {
  McsLoadingService,
  CoreDefinition
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
    private _loadingService: McsLoadingService,
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
    this._loadingService.showLoader('Loading notification details');
    this.job$ = this._jobsRepository.getByIdAsync(jobId).pipe(
      shareReplay(),
      finalize(() => this._loadingService.hideLoader())
    );
  }

  /**
   * Subscribes to jobs data change
   */
  private _subscribeToJobsDataChange(): void {
    this._jobsRepository.dataChange().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }
}

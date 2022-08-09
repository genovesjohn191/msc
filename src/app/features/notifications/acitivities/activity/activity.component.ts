import {
  Observable,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsJob } from '@app/models';
import {
  getSafeProperty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-activity',
  templateUrl: './activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ActivityComponent implements OnInit, OnDestroy {
  public job$: Observable<McsJob>;

  private _jobDataChangeHandler: Subscription;

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToActivityResolver();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._jobDataChangeHandler);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get dotIconKey(): string {
    return CommonDefinition.ASSETS_SVG_BULLET;
  }

  private _subscribeToActivityResolver(): void {
    this.job$ = this._activatedRoute.data.pipe(
      map((resolver) => {
        return getSafeProperty(resolver, (obj) => obj.activity)
      }),
      shareReplay(1)
    );
  }

  /**
   * Registers the events for data changed
   */
  private _registerEvents(): void {
    this._jobDataChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.dataChangeJobs, () => this._changeDetectorRef.markForCheck()
    );
  }
}

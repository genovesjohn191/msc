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
  selector: 'mcs-notification',
  templateUrl: './notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationComponent implements OnInit, OnDestroy {
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
    this._subscribeToNotificationResolver();
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

  /**
   * Subscribes to notification resolver
   */
  private _subscribeToNotificationResolver(): void {
    this.job$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.notification)),
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

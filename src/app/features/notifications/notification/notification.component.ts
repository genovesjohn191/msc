import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  Subscription
} from 'rxjs';
import {
  shareReplay,
  map
} from 'rxjs/operators';
import { McsJob } from '@app/models';
import { CoreDefinition } from '@app/core';
import {
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';

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
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get dotIconKey(): string {
    return CoreDefinition.ASSETS_FONT_BULLET;
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

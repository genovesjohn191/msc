import {
  catchError,
  map,
  throwError
} from 'rxjs';

import {
  Component,
  Input,
  Output,
  NgZone,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';

import {
  McsNotice,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  CommonDefinition,
  refreshView
} from '@app/utilities';
import { McsNotificationNoticeService } from '@app/core';

@Component({
  selector: 'mcs-notice-panel',
  templateUrl: './notice-panel.component.html',
  styleUrls: ['./notice-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'notice-panel-wrapper'
  }
})

export class NoticePanelComponent {
  @Input()
  public notice: McsNotice;

  @Output()
  public remove = new EventEmitter<McsNotice>();

  public acknowledgeInProgress: boolean = false;
  public animationTrigger: string;

  public get closeIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOSE_WHITE;
  }

  public get bulletIconKey(): string {
    return CommonDefinition.ASSETS_SVG_BULLET;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public constructor(
    private _ngZone: NgZone,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _notificationNotices: McsNotificationNoticeService
  ) { }

  public onClickNotice(notice: McsNotice): void {
    this.acknowledgeInProgress = true;
    this._changeDetectorRef.markForCheck();
    this._acknowledgeNotice(notice);
  }

  /**
   * Triggers the animation to remove the notice from the panel
   */
  private _removeNoticeInPanel(notice: McsNotice, timeOut: number): void {
    refreshView(() => {
      this._triggerAnimation();

      this._ngZone.runOutsideAngular(() => {
        refreshView(() => {
          this.remove.emit(notice);
          this._notificationNotices.updateAcknowledgedNotice(notice);
        }, CommonDefinition.NOTIFICATION_ANIMATION_DELAY);
      });
    }, timeOut);
  }

  private _triggerAnimation(): void {
    this.animationTrigger = 'fadeOut';
    this._changeDetectorRef.markForCheck();
  }

  private _acknowledgeNotice(selectedNotice: McsNotice): void {
    this._apiService.acknowledgeNotice(selectedNotice.id).pipe(
      map(() => {
        this._removeNoticeInPanel(selectedNotice, 0);
        this.acknowledgeInProgress = false;
        this._changeDetectorRef.markForCheck();
      }),
      catchError(error => {
        this.acknowledgeInProgress = false;
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      })
    ).subscribe();
  }
}

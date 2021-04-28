import { Subscription } from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef
} from '@angular/material/snack-bar';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsStateNotification } from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-state-notification',
  templateUrl: './state-notification.component.html',
  styleUrls: ['./state-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'state-notification-wrapper'
  }
})
export class StateNotificationComponent implements OnDestroy {
  public tryAgainFunc: () => void;

  private _notificationRef: MatSnackBarRef<any>
  private _notificationUi: TemplateRef<McsStateNotification>;
  private _stateNotificationHandler: Subscription;

  constructor(
    private _snackBar: MatSnackBar,
    private _eventBusDispatcher: EventBusDispatcherService
  ) {
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._stateNotificationHandler);
  }

  @ViewChild(TemplateRef, { static: false })
  public set notificationUi(value: TemplateRef<McsStateNotification>) {
    this._notificationUi = value;
  }

  public onClickTryAgain(): void {
    if (!isNullOrEmpty(this.tryAgainFunc)) {
      this.tryAgainFunc();
    }
    this._notificationRef?.dismiss();
  }

  private _registerEvents(): void {
    this._stateNotificationHandler = this._eventBusDispatcher.addEventListener(
      McsEvent.stateNotificationShow, this._onNotificationChange.bind(this));
  }

  private _onNotificationChange(state: McsStateNotification): void {
    if (isNullOrEmpty(state)) { return; }
    this._showNotification(state);
    this.tryAgainFunc = state?.tryAgainFunc;
  }

  private _showNotification(state: McsStateNotification): void {
    if (isNullOrEmpty(this._notificationUi)) { return; }

    this._notificationRef = this._snackBar.openFromTemplate(this._notificationUi, {
      duration: state.duration || CommonDefinition.STATE_NOTIFICATION_DEFAULT_DURATION,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      data: state,
      panelClass: ['state-notification-snackbar']
    });
  }
}

import { NotifierService } from 'angular-notifier';
import {
  Subject,
  Subscription
} from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsStateNotification } from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  Guid
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
  private _stateNotificationHandler: Subscription;
  private _destroySubject = new Subject<void>();

  @ViewChild(TemplateRef)
  private _templateRef: TemplateRef<any>;

  constructor(
    private _eventBusDispatcher: EventBusDispatcherService,
    private _notifierService: NotifierService
  ) {
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._stateNotificationHandler);
    unsubscribeSafely(this._destroySubject);
  }

  @ViewChild(TemplateRef, { static: false })
  public set notificationUi(value: TemplateRef<McsStateNotification>) {
    this._templateRef = value;
  }

  public onClickTryAgain(): void {
    if (!isNullOrEmpty(this.tryAgainFunc)) {
      this.tryAgainFunc();
    }
    this._notificationRef?.dismiss();
  }

  public getDataFromString(message: string): McsStateNotification {
    return message as any;  // Hack mode since the angular notifier only supports string.
  }

  public onCloseNotification(id: string): void {
    this._notifierService.hide(id);
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
    if (isNullOrEmpty(this._templateRef)) { return; }

    this._notifierService.show({
      id: Guid.newGuid().toString(),
      type: 'default',
      message: state as any,
      template: this._templateRef
    });
  }
}

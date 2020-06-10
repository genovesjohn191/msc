import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import { Subscription } from 'rxjs';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  McsSystemMessage,
  Severity,
  MessageType
} from '@app/models';
import {
  unsubscribeSafely,
  isNullOrEmpty,
  McsStatusType
} from '@app/utilities';
import { McsEvent } from '@app/events';

@Component({
  selector: 'mcs-system-message-banner',
  templateUrl: './system-message-banner.component.html',
  styleUrls: ['./system-message-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'system-message-banner-wrapper'
  }
})

export class SystemMessageBannerComponent implements OnDestroy {

  public systemMessage: McsSystemMessage;
  public hasActiveMessage: boolean;
  public alertType: string;
  public icon: string;

  private _messageShowHandler: Subscription;
  private _messageHideHandler: Subscription;

  private _alertTypeTableMap: Map<Severity, McsStatusType>;

  constructor(
    private _eventBusDispatcher: EventBusDispatcherService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this._registerEvents();
    this._createAlertTypeTable();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._messageShowHandler);
    unsubscribeSafely(this._messageHideHandler);
  }

  /**
   * Registers all the associated events
   */
  private _registerEvents(): void {
    this._messageShowHandler = this._eventBusDispatcher.addEventListener(
      McsEvent.systemMessageShow, this._onSystemMessageShow.bind(this));

    this._messageHideHandler = this._eventBusDispatcher.addEventListener(
      McsEvent.systemMessageHide, this._onSystemMessageHide.bind(this));
  }

  /**
   * Event that emits when active system message has been displayed
   * @param message Message to be displayed
   */
  private _onSystemMessageShow(message: McsSystemMessage): void {
    if (isNullOrEmpty(message)) { return; }
    this.hasActiveMessage = true;
    this.systemMessage = message;
    this._setAlertType(message);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when active system message has been hidden
   */
  private _onSystemMessageHide(): void {
    this.hasActiveMessage = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Set the alert type based on the message type or severity
   * of the active message
   */
  private _setAlertType(message: McsSystemMessage): void {
    if (isNullOrEmpty(message)) { return; }
    this.alertType = this._alertTypeTableMap.get(message.severity) || 'info';
    let lowSeverityAlert: boolean = message.type === MessageType.Alert && this.alertType === 'info';
    this.icon = lowSeverityAlert ? 'warning' : this.alertType;
  }

  /**
   * Creates the alert type table map
   */
  private _createAlertTypeTable(): void {
    if (!isNullOrEmpty(this._alertTypeTableMap)) { return; }
    this._alertTypeTableMap = new Map<Severity, McsStatusType>();
    this._alertTypeTableMap.set(Severity.Low, 'info');
    this._alertTypeTableMap.set(Severity.Medium, 'warning');
    this._alertTypeTableMap.set(Severity.High, 'error');
    this._alertTypeTableMap.set(Severity.Critical, 'error');
  }
}

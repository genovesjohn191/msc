import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Renderer2,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  McsApiJob,
  McsNotificationContextService,
  CoreDefinition
} from '../../core';
import { refreshView } from '../../utilities';

@Component({
  selector: 'mcs-state-change-notifications',
  templateUrl: './state-change-notifications.component.html',
  styles: [require('./state-change-notifications.component.scss')]
})

export class StateChangeNotificationsComponent implements OnInit, OnDestroy {
  @Input()
  public placement: 'left' | 'right';

  @ViewChild('stateChangeNotificationsElement')
  public stateChangeNotificationsElement: ElementRef;

  public notifications: McsApiJob[];
  public notificationsSubscription: any;
  public visible: boolean;

  public constructor(
    private _notificationContext: McsNotificationContextService,
    private _renderer: Renderer2,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.placement = 'left';
    this.notifications = new Array();
    this.visible = true;
  }

  public ngOnInit() {
    // Subscribe to notification changes
    this.notificationsSubscription = this._notificationContext.notificationsStream
      .subscribe((updatedNotifications) => {
        // Obtain error notification only
        this.notifications = updatedNotifications.filter((notification) => {
          return notification.status === CoreDefinition.NOTIFICATION_JOB_CANCELLED ||
            notification.status === CoreDefinition.NOTIFICATION_JOB_TIMEDOUT ||
            notification.status === CoreDefinition.NOTIFICATION_JOB_FAILED ||
            notification.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        });
        refreshView(() => {
          this._changeDetectorRef.detectChanges();
        }, CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
      });

    // Set notifications placement
    this.setPlacement();
  }

  public ngOnDestroy() {
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
  }

  public setPlacement() {
    if (!this.stateChangeNotificationsElement) { return; }
    switch (this.placement) {
      case 'left':
        this._renderer.setStyle(this.stateChangeNotificationsElement.nativeElement,
          'left', '20px');
        break;

      case 'right':
      default:
        this._renderer.setStyle(this.stateChangeNotificationsElement.nativeElement,
          'right', '20px');
        break;
    }
  }
}

import {
  Component,
  OnInit,
  Input,
  Renderer2,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import {
  McsApiJob,
  McsNotificationContextService,
  CoreDefinition
} from '../../core';

@Component({
  selector: 'mcs-state-change-notifications',
  templateUrl: './state-change-notifications.component.html',
  styles: [require('./state-change-notifications.component.scss')]
})

export class StateChangeNotificationsComponent implements OnInit {
  @Input()
  public placement: 'left' | 'right';

  @ViewChild('stateChangeNotificationsElement')
  public stateChangeNotificationsElement: ElementRef;

  public notifications: McsApiJob[];

  public constructor(
    private _notificationContext: McsNotificationContextService,
    private _renderer: Renderer2,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.placement = 'left';
    this.notifications = new Array();
  }

  public ngOnInit() {
    // Subscribe to notification changes
    this._notificationContext.notificationsStream
      .subscribe((updatedNotifications) => {
        // Obtain error notification only
        this.notifications = updatedNotifications.filter((notification) => {
          return notification.status === CoreDefinition.NOTIFICATION_JOB_CANCELLED ||
            notification.status === CoreDefinition.NOTIFICATION_JOB_TIMEDOUT ||
            notification.status === CoreDefinition.NOTIFICATION_JOB_FAILED ||
            notification.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        });
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
        }, CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
      });

    // Set notifications placement
    this.setPlacement();
  }

  public setPlacement() {
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

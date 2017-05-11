import {
  async,
  inject,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { Subject } from 'rxjs/Rx';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationUiComponent } from './notification-ui.component';
import {
  McsAssetsProvider,
  McsNotification,
  McsNotificationContextService,
  McsNotificationJobService,
  CoreDefinition
} from '../../core';

describe('NotificationUiComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: NotificationUiComponent;
  let mcsNotificationContextService: McsNotificationContextService;

  let mockMcsNotificationJobService = {
    notificationStream: new Subject<McsNotification>(),
    connectionStatusStream: new Subject<any>()
  } as McsNotificationJobService;

  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        spinner: 'fa fa-spinner',
        close: 'fa fa-close',
        check: 'fa fa-check'
      };
      return icons[key];
    }
  } as McsAssetsProvider;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        NotificationUiComponent
      ],
      providers: [
        McsNotificationContextService,
        { provide: McsNotificationJobService, useValue: mockMcsNotificationJobService },
        { provide: McsAssetsProvider, useValue: mockAssetsProvider }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(NotificationUiComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(NotificationUiComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  // Creation of notification based on id and status
  let createNotification = (notificationId: string, notificationStatus: string) => {
    let notification: McsNotification = new McsNotification();

    notification.id = notificationId;
    notification.ownerId = 'Owner' + notificationId;
    notification.accountId = 'Account' + notificationId;
    notification.errorMessage = notificationStatus;
    notification.jobDefinitionId = 'Job' + notificationId;
    notification.createdOn = new Date('2017-04-26T01:51:34Z');
    notification.startedOn = new Date('2017-04-26T01:51:34Z');
    notification.updatedOn = new Date('2017-04-26T01:55:12Z');
    notification.endedOn = null;
    notification.status = notificationStatus;
    notification.summaryInformation = 'Test Job 2 Summary';
    notification.ownerName = 'Shaun Domingo';
    notification.durationInSeconds = 0;
    notification.description = 'mongo-db' + notificationId;

    return notification;
  };

  /** Test Implementation */
  describe('ngOnChanges() when notification is active', () => {
    let notification: McsNotification;
    beforeEach(async(() => {
      notification = new McsNotification();
      notification = createNotification('1', 'Active');

      mockMcsNotificationJobService.notificationStream.next(notification);
      component.attribute = notification;
      component.ngOnChanges();
    }));

    it('should set the active class to iconStatusClass', () => {
      expect(component.iconStatusClass).toContain('active');
    });

    it('should set the fa-spinner class to iconStatusClass', () => {
      expect(component.iconStatusClass).toContain('fa-spinner');
    });

    it('should not remove the notification',
      inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {
          spyOn(notificationContextService, 'deleteNotificationById');
          component.attribute = notification;
          component.ngOnChanges();
          expect(notificationContextService.deleteNotificationById).not.toHaveBeenCalled();
        }));
  });

  describe('ngOnChanges() when notification is failed', () => {
    let notification: McsNotification;
    beforeEach(fakeAsync(() => {
      notification = new McsNotification();
      notification = createNotification('1', 'Failed');

      mockMcsNotificationJobService.notificationStream.next(notification);
      component.attribute = notification;
      component.ngOnChanges();
      tick(CoreDefinition.NOTIFICATION_FAILED_TIMEDOUT);
      tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
    }));

    it('should set the failed class to iconStatusClass', () => {
      expect(component.iconStatusClass).toContain('failed');
    });

    it('should set the fa-close class to iconStatusClass', () => {
      expect(component.iconStatusClass).toContain('fa-close');
    });

    it('should remove the failed notifications',
      inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {
          let subscription = notificationContextService.notificationsStream
            .subscribe((notifications) => {
              expect(notifications.length).toBe(0);
            });
          subscription.unsubscribe();
        }));
  });

  describe('ngOnChanges() when notification is completed', () => {
    let notification: McsNotification;
    beforeEach(fakeAsync(() => {
      notification = new McsNotification();
      notification = createNotification('1', 'Completed');

      mockMcsNotificationJobService.notificationStream.next(notification);
      component.attribute = notification;
      component.ngOnChanges();
      tick(CoreDefinition.NOTIFICATION_COMPLETED_TIMEDOUT);
      tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
    }));

    it('should set the failed class to iconStatusClass', () => {
      expect(component.iconStatusClass).toContain('completed');
    });

    it('should set the fa-check class to iconStatusClass', () => {
      expect(component.iconStatusClass).toContain('fa-check');
    });

    it('should remove the completed notifications',
      inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {
          let subscription = notificationContextService.notificationsStream
            .subscribe((notifications) => {
              expect(notifications.length).toBe(0);
            });
          subscription.unsubscribe();
        }));
  });

  describe('getStartTime()', () => {
    let notification: McsNotification;
    beforeEach(fakeAsync(() => {
      notification = new McsNotification();
      notification = createNotification('1', 'Completed');

      mockMcsNotificationJobService.notificationStream.next(notification);
      component.attribute = notification;
      component.ngOnChanges();
      tick(CoreDefinition.NOTIFICATION_COMPLETED_TIMEDOUT);
      tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
    }));

    it('should get the started time', () => {
      expect(component.getStartTime()).toBe(notification.startedOn.toLocaleTimeString(
        navigator.language, { hour: '2-digit', minute: '2-digit' }));
    });

    it('should get empty string if no started date', () => {
      component.attribute.startedOn = null;
      expect(component.getStartTime()).toBe('');
    });
  });

  describe('displayErrorMessage()', () => {
    it('should return true in case of failed', () => {
      let isDisplayed: boolean;
      isDisplayed = component.displayErrorMessage(CoreDefinition.NOTIFICATION_JOB_FAILED);
      expect(isDisplayed).toBe(true);
    });

    it('should return true in case of timedout', () => {
      let isDisplayed: boolean;
      isDisplayed = component.displayErrorMessage(CoreDefinition.NOTIFICATION_JOB_TIMEDOUT);
      expect(isDisplayed).toBe(true);
    });

    it('should return true in case of cancelled', () => {
      let isDisplayed: boolean;
      isDisplayed = component.displayErrorMessage(CoreDefinition.NOTIFICATION_JOB_CANCELLED);
      expect(isDisplayed).toBe(true);
    });

    it('should return false in case of completed', () => {
      let isDisplayed: boolean;
      isDisplayed = component.displayErrorMessage(CoreDefinition.NOTIFICATION_JOB_COMPLETED);
      expect(isDisplayed).toBe(false);
    });

    it('should return false in case of active', () => {
      let isDisplayed: boolean;
      isDisplayed = component.displayErrorMessage(CoreDefinition.NOTIFICATION_JOB_ACTIVE);
      expect(isDisplayed).toBe(false);
    });

    it('should return false in case of pending', () => {
      let isDisplayed: boolean;
      isDisplayed = component.displayErrorMessage(CoreDefinition.NOTIFICATION_JOB_PENDING);
      expect(isDisplayed).toBe(false);
    });
  });
});

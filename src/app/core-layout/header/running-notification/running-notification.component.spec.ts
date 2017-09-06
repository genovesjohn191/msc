import {
  async,
  inject,
  TestBed,
  fakeAsync,
  tick,
  getTestBed
} from '@angular/core/testing';
import { RunningNotificationComponent } from './running-notification.component';
import {
  McsApiJob,
  McsNotificationContextService,
  McsNotificationJobService,
  CoreDefinition
} from '../../../core';
import { CoreLayoutTestingModule } from '../../testing';

describe('RunningNotificationComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: RunningNotificationComponent;
  let mcsNotificationJobService: McsNotificationJobService;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        RunningNotificationComponent
      ],
      imports: [
        CoreLayoutTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(RunningNotificationComponent, {
      set: {
        template: `
          <div>RunningNotificationComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(RunningNotificationComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      mcsNotificationJobService = getTestBed().get(McsNotificationJobService);
    });
  }));

  // Creation of notification based on id and status
  let createNotification = (notificationId: string, notificationStatus: string) => {
    let notification: McsApiJob = new McsApiJob();

    notification.id = notificationId;
    notification.errorMessage = notificationStatus;
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
    let notification: McsApiJob;
    beforeEach(async(() => {
      notification = new McsApiJob();
      notification = createNotification('1', 'Active');

      mcsNotificationJobService.notificationStream.next(notification);
      component.attribute = notification;
      component.ngOnChanges();
    }));

    it('should set the iconStatusColor to black', () => {
      expect(component.iconStatusColor).toBe('black');
    });

    it('should set the font-spinner definition to iconStatusClass', () => {
      expect(component.iconStatusKey).toBe(CoreDefinition.ASSETS_GIF_SPINNER);
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
    let notification: McsApiJob;
    beforeEach(fakeAsync(() => {
      notification = new McsApiJob();
      notification = createNotification('1', 'Failed');

      mcsNotificationJobService.notificationStream.next(notification);
      component.attribute = notification;
      component.ngOnChanges();
      tick(CoreDefinition.NOTIFICATION_FAILED_TIMEOUT);
      tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
    }));

    it('should set the iconStatusColor to red', () => {
      expect(component.iconStatusColor).toContain('red');
    });

    it('should set the font-close definition to iconStatusClass', () => {
      expect(component.iconStatusKey).toBe(CoreDefinition.ASSETS_FONT_CLOSE);
    });

    it('should remove the failed notifications',
      inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {
          let subscription = notificationContextService.notificationsStream
            .subscribe((notifications) => {
              expect(notifications.length).toBe(0);
            });
          if (subscription) { subscription.unsubscribe(); }
        }));
  });

  describe('ngOnChanges() when notification is completed', () => {
    let notification: McsApiJob;
    beforeEach(fakeAsync(() => {
      notification = new McsApiJob();
      notification = createNotification('1', 'Completed');

      mcsNotificationJobService.notificationStream.next(notification);
      component.attribute = notification;
      component.ngOnChanges();
      tick(CoreDefinition.NOTIFICATION_COMPLETED_TIMEOUT);
      tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
    }));

    it('should set the iconStatusColor to green', () => {
      expect(component.iconStatusColor).toContain('green');
    });

    it('should set the font-check definition to iconStatusClass', () => {
      expect(component.iconStatusKey).toBe(CoreDefinition.ASSETS_FONT_CHECK);
    });

    it('should remove the completed notifications',
      inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {
          let subscription = notificationContextService.notificationsStream
            .subscribe((notifications) => {
              expect(notifications.length).toBe(0);
            });
          if (subscription) { subscription.unsubscribe(); }
        }));
  });

  describe('getStartTime()', () => {
    let notification: McsApiJob;
    beforeEach(fakeAsync(() => {
      notification = new McsApiJob();
      notification = createNotification('1', 'Completed');

      mcsNotificationJobService.notificationStream.next(notification);
      component.attribute = notification;
      component.ngOnChanges();
      tick(CoreDefinition.NOTIFICATION_COMPLETED_TIMEOUT);
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

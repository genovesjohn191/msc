import {
  async,
  inject,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { UserPanelComponent } from './user-panel.component';
import {
  McsApiJob,
  McsNotificationContextService,
  CoreDefinition,
  McsConnectionStatus
} from '../../../core';
import { CoreLayoutTestingModule } from '../../testing';

describe('UserPanelComponent', () => {

  /** Stub Services/Components */
  let component: UserPanelComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        UserPanelComponent
      ],
      imports: [
        CoreLayoutTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(UserPanelComponent, {
      set: {
        template: `
          <div>UserPanelComponent Template</div>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(UserPanelComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should return the bell icon definition key', () => {
      expect(component.bellIconKey).toBe(CoreDefinition.ASSETS_FONT_BELL);
    });

    it('should return the user icon definition key', () => {
      expect(component.userIconKey).toBe(CoreDefinition.ASSETS_FONT_USER);
    });

    it('should return the caret down icon definition key', () => {
      expect(component.caretDownIconKey).toBe(CoreDefinition.ASSETS_FONT_CARET_DOWN);
    });

    it('should return the caret right icon definition key', () => {
      expect(component.caretRightIconKey).toBe(CoreDefinition.ASSETS_FONT_CARET_RIGHT);
    });
  });

  describe('notificationsStream()', () => {

    it('should get the active job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsApiJob[] = new Array();

          let notificationActive = new McsApiJob();
          notificationActive.id = '5';
          notificationActive.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
          notifications.push(notificationActive);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));

    it('should get the pending job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsApiJob[] = new Array();

          let notificationPending = new McsApiJob();
          notificationPending.id = '5';
          notificationPending.status = CoreDefinition.NOTIFICATION_JOB_PENDING;
          notifications.push(notificationPending);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));

    it('should get the failed job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsApiJob[] = new Array();

          let notificationFailed = new McsApiJob();
          notificationFailed.id = '5';
          notificationFailed.status = CoreDefinition.NOTIFICATION_JOB_FAILED;
          notifications.push(notificationFailed);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));

    it('should get the timedout job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsApiJob[] = new Array();

          let notificationFailed = new McsApiJob();
          notificationFailed.id = '5';
          notificationFailed.status = CoreDefinition.NOTIFICATION_JOB_TIMEDOUT;
          notifications.push(notificationFailed);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));

    it('should get the cancelled job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsApiJob[] = new Array();

          let notificationFailed = new McsApiJob();
          notificationFailed.id = '5';
          notificationFailed.status = CoreDefinition.NOTIFICATION_JOB_CANCELLED;
          notifications.push(notificationFailed);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));

    it('should get the completed job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsApiJob[] = new Array();

          let notificationCompleted = new McsApiJob();
          notificationCompleted.id = '5';
          notificationCompleted.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
          notifications.push(notificationCompleted);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));
  });

  describe('connectionStatusStream()', () => {
    it('should set the hasConnectionError to true in case of error in connection',
      inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {
          notificationContextService.connectionStatusStream.next(McsConnectionStatus.Failed);
          expect(component.hasConnectionError).toBe(true);
        }));

    it('should set the hasConnectionError to true in case of fatal in connection',
      inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {
          notificationContextService.connectionStatusStream.next(McsConnectionStatus.Fatal);
          expect(component.hasConnectionError).toBe(true);
        }));

    it('should set the hasConnectionError to false in case of success in connection',
      inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {
          notificationContextService.connectionStatusStream.next(McsConnectionStatus.Success);
          expect(component.hasConnectionError).toBe(false);
        }));
  });
});

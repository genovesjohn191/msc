import {
  async,
  inject,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { UserPanelComponent } from './user-panel.component';
import {
  McsNotificationContextService,
  CoreDefinition
} from '@app/core';
import {
  McsJob,
  McsJobStatus
} from '@app/models';
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
      expect(component.userIconKey).toBe(CoreDefinition.ASSETS_SVG_USER_WHITE);
    });

    it('should return the caret down icon definition key', () => {
      expect(component.caretDownIconKey).toBe(CoreDefinition.ASSETS_FONT_CHEVRON_DOWN);
    });

    it('should return the caret right icon definition key', () => {
      expect(component.logoutIconKey).toBe(CoreDefinition.ASSETS_SVG_LOGOUT_WHITE);
    });
  });

  describe('notificationsStream()', () => {

    it('should get the active job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsJob[] = new Array();

          let notificationActive = new McsJob();
          notificationActive.id = '5';
          notificationActive.status = McsJobStatus.Active;
          notifications.push(notificationActive);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));

    it('should get the pending job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsJob[] = new Array();

          let notificationPending = new McsJob();
          notificationPending.id = '5';
          notificationPending.status = McsJobStatus.Pending;
          notifications.push(notificationPending);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));

    it('should get the failed job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsJob[] = new Array();

          let notificationFailed = new McsJob();
          notificationFailed.id = '5';
          notificationFailed.status = McsJobStatus.Failed;
          notifications.push(notificationFailed);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));

    it('should get the timedout job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsJob[] = new Array();

          let notificationFailed = new McsJob();
          notificationFailed.id = '5';
          notificationFailed.status = McsJobStatus.Timedout;
          notifications.push(notificationFailed);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));

    it('should get the cancelled job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsJob[] = new Array();

          let notificationFailed = new McsJob();
          notificationFailed.id = '5';
          notificationFailed.status = McsJobStatus.Cancelled;
          notifications.push(notificationFailed);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));

    it('should get the completed job notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsJob[] = new Array();

          let notificationCompleted = new McsJob();
          notificationCompleted.id = '5';
          notificationCompleted.status = McsJobStatus.Completed;
          notifications.push(notificationCompleted);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(1);
        }))));
  });
});

import {
  async,
  inject,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import {

} from '@angular/common/testing';
import { Subject } from 'rxjs/Rx';
import { RouterTestingModule } from '@angular/router/testing';
import { UserPanelComponent } from './user-panel.component';
import {
  McsAssetsProvider,
  McsTextContentProvider,
  McsNotification,
  McsNotificationContextService,
  McsNotificationJobService,
  McsBrowserService,
  CoreDefinition,
  McsConnectionStatus
} from '../../core';

describe('UserPanelComponent', () => {

  /** Stub Services/Components */
  let component: UserPanelComponent;
  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        'bell': 'fa fa-bell-o',
        'user': 'fa fa-user-o',
        'caret-right': 'fa fa-caret-right'
      };

      return icons[key];
    }
  };
  let mcsNotificationContextService: McsNotificationContextService;
  let mockMcsNotificationJobService = {
    notificationStream: new Subject<McsNotification>(),
    connectionStatusStream: new Subject<McsConnectionStatus>()
  } as McsNotificationJobService;
  let mockMcsBrowserService = new McsBrowserService();

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        UserPanelComponent
      ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        McsNotificationContextService,
        McsTextContentProvider,
        { provide: McsNotificationJobService, useValue: mockMcsNotificationJobService },
        { provide: McsAssetsProvider, useValue: mockAssetsProvider },
        { provide: McsBrowserService, useValue: mockMcsBrowserService }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(UserPanelComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(UserPanelComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should return the icon class of bell icon if the provided bell icon key is valid', () => {
      expect(component.bellIcon).toBeDefined();
    });

    it('should return the icon class of user icon if the provided user icon key is valid', () => {
      expect(component.userIcon).toBeDefined();
    });

    it('should return the icon class of caret right icon if the provided icon key is valid', () => {
      expect(component.caretRightIcon).toBeDefined();
    });
  });

  describe('notificationsStream()', () => {
    it('should get the notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsNotification[] = new Array();
          notifications.push(new McsNotification());
          notifications.push(new McsNotification());

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(2);
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

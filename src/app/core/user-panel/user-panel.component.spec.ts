import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { Subject } from 'rxjs/Rx';
import { RouterTestingModule } from '@angular/router/testing';
import { UserPanelComponent } from './user-panel.component';
import { McsNotification } from '../models/mcs-notification';
import { AssetsProvider } from '../providers/assets.provider';
import { McsNotificationContextService } from '../services/mcs-notification-context.service';

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
  let mockNotificationContext = {
    notificationsStream: new Subject<McsNotification[]>()
  };

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
        { provide: McsNotificationContextService, useValue: mockNotificationContext },
        { provide: AssetsProvider, useValue: mockAssetsProvider }
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

  describe('Notifications()', () => {
    it('should get the notifications from the notification context service',
      inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

        let notifications: McsNotification[] = new Array();
        notifications.push(new McsNotification());
        notifications.push(new McsNotification());

        notificationContextService.notificationsStream.next(notifications);
        expect(component.notifications).toBeDefined();
        expect(component.notifications.length).toBe(2);
    }));
  });
});

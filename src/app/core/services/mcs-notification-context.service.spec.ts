import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { Subject } from 'rxjs/Rx';
import { McsNotification } from '../models/mcs-notification';
import { McsNotificationJobService } from './mcs-notification-job.service';
import { McsNotificationContextService } from './mcs-notification-context.service';

describe('McsNotificationContextService', () => {

  /** Stub Services Mock */
  let mcsNotificationContextService: McsNotificationContextService;
  let mockMcsNotificationService = {
    notificationStream: new Subject<McsNotification>()
  } as McsNotificationJobService;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
      ],
      providers: [
        { provide: McsNotificationJobService, useValue: mockMcsNotificationService },
        McsNotificationContextService
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mcsNotificationContextService = getTestBed().get(McsNotificationContextService);
    });
  }));

  /** Test Implementation */
  describe('NotificationsStream()', () => {
    let initId = '0001';
    let initDescription = 'Server01';

    beforeEach(async(() => {
      let notification = new McsNotification();
      notification.id = initId;
      notification.description = initDescription;
      mockMcsNotificationService.notificationStream.next(notification);
    }));

    it('should get the omitted value from the notification job stream', () => {
      let updatedNotifications: McsNotification[];
      mcsNotificationContextService.notificationsStream.subscribe((notifications) => {
        updatedNotifications = notifications;
      });

      expect(updatedNotifications).toBeDefined();
      expect(updatedNotifications.length).toBe(1);
      expect(updatedNotifications[0].id).toBe(initId);
      expect(updatedNotifications[0].description).toBe(initDescription);
    });

    it(`should update the notification data on the list
    when the notification omitted is already exist`, () => {
        let updatedNotifications: McsNotification[];
        let notification = new McsNotification();
        let updatedDescription = 'Server02';

        notification.id = initId;
        notification.description = updatedDescription;
        mockMcsNotificationService.notificationStream.next(notification);

        mcsNotificationContextService.notificationsStream.subscribe((notifications) => {
          updatedNotifications = notifications;
        });

        expect(updatedNotifications.length).toBe(1);
        expect(updatedNotifications[0].id).toBe(initId);
        expect(updatedNotifications[0].description).toBe(updatedDescription);
      });

    it(`should add the notification item to the list
    when the notification omitted is not yet exist`, () => {
        let updatedNotifications: McsNotification[];
        let notification = new McsNotification();
        let newId = '0002';
        let newDescription = 'Server03';
        notification.id = newId;
        notification.description = newDescription;
        mockMcsNotificationService.notificationStream.next(notification);

        mcsNotificationContextService.notificationsStream.subscribe((notifications) => {
          updatedNotifications = notifications;
        });

        expect(updatedNotifications.length).toBe(2);
        expect(updatedNotifications[0].id).toBe(initId);
        expect(updatedNotifications[0].description).toBe(initDescription);
        expect(updatedNotifications[1].id).toBe(newId);
        expect(updatedNotifications[1].description).toBe(newDescription);
      });
  });
});

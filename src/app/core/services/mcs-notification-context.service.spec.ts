import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { McsApiJob } from '../models/response/mcs-api-job';
import { McsNotificationJobService } from './mcs-notification-job.service';
import { McsNotificationContextService } from './mcs-notification-context.service';
import { McsConnectionStatus } from '../enumerations/mcs-connection-status.enum';
import { CoreTestingModule } from '../testing';
import { unsubscribeSafely } from '../../utilities';

describe('McsNotificationContextService', () => {

  /** Stub Services Mock */
  let mcsNotificationContextService: McsNotificationContextService;
  let mcsNotifcationsJobService: McsNotificationJobService;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        CoreTestingModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mcsNotificationContextService = getTestBed().get(McsNotificationContextService);
      mcsNotifcationsJobService = getTestBed().get(McsNotificationJobService);
    });
  }));

  /** Test Implementation */
  describe('NotificationsStream() | _updateNotifications()', () => {
    let initId = '0001';
    let initDescription = 'Server01';

    beforeEach(async(() => {
      let notification = new McsApiJob();
      notification.id = initId;
      notification.description = initDescription;
      mcsNotifcationsJobService.notificationStream.next(notification);
    }));

    it('should get the omitted value from the notification job stream', () => {
      let updatedNotifications: McsApiJob[];
      let subscriber = mcsNotificationContextService.notificationsStream
        .subscribe((notifications) => {
          updatedNotifications = notifications;
        });

      expect(updatedNotifications).toBeDefined();
      expect(updatedNotifications.length).toBe(1);
      expect(updatedNotifications[0].id).toBe(initId);
      expect(updatedNotifications[0].description).toBe(initDescription);

      unsubscribeSafely(subscriber);
    });

    it(`should update the notification data on the list
    when the notification omitted is already exist`, () => {
        let updatedNotifications: McsApiJob[];
        let notification = new McsApiJob();
        let updatedDescription = 'Server02';

        notification.id = initId;
        notification.description = updatedDescription;
        mcsNotifcationsJobService.notificationStream.next(notification);

        let subscriber = mcsNotificationContextService.notificationsStream
          .subscribe((notifications) => {
            updatedNotifications = notifications;
          });

        expect(updatedNotifications.length).toBe(1);
        expect(updatedNotifications[0].id).toBe(initId);
        expect(updatedNotifications[0].description).toBe(updatedDescription);

        unsubscribeSafely(subscriber);
      });

    it(`should add the notification item to the list
    when the notification omitted is not yet exist`, () => {
        let updatedNotifications: McsApiJob[];
        let notification = new McsApiJob();
        let newId = '0002';
        let newDescription = 'Server03';
        notification.id = newId;
        notification.description = newDescription;
        mcsNotifcationsJobService.notificationStream.next(notification);

        let subscriber = mcsNotificationContextService.notificationsStream
          .subscribe((notifications) => {
            updatedNotifications = notifications;
          });

        expect(updatedNotifications.length).toBe(2);
        expect(updatedNotifications[0].id).toBe(newId);
        expect(updatedNotifications[0].description).toBe(newDescription);
        expect(updatedNotifications[1].id).toBe(initId);
        expect(updatedNotifications[1].description).toBe(initDescription);

        unsubscribeSafely(subscriber);
      });
  });

  describe('NotificationsStream() | _updateNotifications()', () => {
    let initId = '0001';
    let initDescription = 'Server01';

    beforeEach(async(() => {
      let notification = new McsApiJob();
      notification.id = initId;
      notification.description = initDescription;
      mcsNotifcationsJobService.notificationStream.next(notification);
    }));

    it('should get the omitted value from the notification job stream', () => {
      let updatedNotifications: McsApiJob[];
      let subscriber = mcsNotificationContextService.notificationsStream
        .subscribe((notifications) => {
          updatedNotifications = notifications;
        });

      expect(updatedNotifications).toBeDefined();
      expect(updatedNotifications.length).toBe(1);
      expect(updatedNotifications[0].id).toBe(initId);
      expect(updatedNotifications[0].description).toBe(initDescription);

      unsubscribeSafely(subscriber);
    });
  });

  describe('connectionStatusStream() | _notifyConnectionStatus()', () => {
    it(`should get the omitted status of connection from the notification job stream`,
      () => {
        mcsNotifcationsJobService.connectionStatusStream.next(McsConnectionStatus.Success);
        let subscriber = mcsNotificationContextService.connectionStatusStream
          .subscribe((status) => {
            expect(status).toBe(McsConnectionStatus.Success);
          });

        unsubscribeSafely(subscriber);
      });
  });
});

import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { Subject } from 'rxjs/Rx';
import { McsApiJob } from '../models/mcs-api-job';
import { McsNotificationJobService } from './mcs-notification-job.service';
import { McsNotificationContextService } from './mcs-notification-context.service';
import { McsConnectionStatus } from '../enumerations/mcs-connection-status.enum';

describe('McsNotificationContextService', () => {

  /** Stub Services Mock */
  let mcsNotificationContextService: McsNotificationContextService;
  let mockMcsNotificationJobService = {
    notificationStream: new Subject<McsApiJob>(),
    connectionStatusStream: new Subject<any>()
  } as McsNotificationJobService;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
      ],
      providers: [
        { provide: McsNotificationJobService, useValue: mockMcsNotificationJobService },
        McsNotificationContextService
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mcsNotificationContextService = getTestBed().get(McsNotificationContextService);
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
      mockMcsNotificationJobService.notificationStream.next(notification);
    }));

    it('should get the omitted value from the notification job stream', () => {
      let updatedNotifications: McsApiJob[];
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
        let updatedNotifications: McsApiJob[];
        let notification = new McsApiJob();
        let updatedDescription = 'Server02';

        notification.id = initId;
        notification.description = updatedDescription;
        mockMcsNotificationJobService.notificationStream.next(notification);

        mcsNotificationContextService.notificationsStream.subscribe((notifications) => {
          updatedNotifications = notifications;
        });

        expect(updatedNotifications.length).toBe(1);
        expect(updatedNotifications[0].id).toBe(initId);
        expect(updatedNotifications[0].description).toBe(updatedDescription);
      });

    it(`should add the notification item to the list
    when the notification omitted is not yet exist`, () => {
        let updatedNotifications: McsApiJob[];
        let notification = new McsApiJob();
        let newId = '0002';
        let newDescription = 'Server03';
        notification.id = newId;
        notification.description = newDescription;
        mockMcsNotificationJobService.notificationStream.next(notification);

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

  describe('NotificationsStream() | _updateNotifications()', () => {
    let initId = '0001';
    let initDescription = 'Server01';

    beforeEach(async(() => {
      let notification = new McsApiJob();
      notification.id = initId;
      notification.description = initDescription;
      mockMcsNotificationJobService.notificationStream.next(notification);
    }));

    it('should get the omitted value from the notification job stream', () => {
      let updatedNotifications: McsApiJob[];
      mcsNotificationContextService.notificationsStream.subscribe((notifications) => {
        updatedNotifications = notifications;
      });

      expect(updatedNotifications).toBeDefined();
      expect(updatedNotifications.length).toBe(1);
      expect(updatedNotifications[0].id).toBe(initId);
      expect(updatedNotifications[0].description).toBe(initDescription);
    });
  });

  describe('connectionStatusStream() | _notifyConnectionStatus()', () => {
    it(`should get the omitted status of connection from the notification job stream`,
      () => {
        mockMcsNotificationJobService.connectionStatusStream.next(McsConnectionStatus.Success);
        mcsNotificationContextService.connectionStatusStream.subscribe((status) => {
          expect(status).toBe(McsConnectionStatus.Success);
        });
      });
  });
});

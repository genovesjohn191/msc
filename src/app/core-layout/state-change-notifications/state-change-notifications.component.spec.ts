import {
  async,
  inject,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import {
  Component,
  Input
} from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import { StateChangeNotificationsComponent } from './state-change-notifications.component';
import {
  McsAssetsProvider,
  McsApiJob,
  McsApiService,
  McsBrowserService,
  McsApiRequestParameter,
  McsNotificationContextService,
  McsNotificationJobService,
  CoreDefinition
} from '../../core';

@Component({
  selector: 'mcs-state-change-notification',
  template: ``
})
export class TestComponent {
  @Input()
  public attribute: any;
}

describe('StateChangeNotificationsComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: StateChangeNotificationsComponent;
  let mockMcsBrowserService = new McsBrowserService();
  let mcsNotificationContextService: McsNotificationContextService;

  let mockMcsNotificationJobService = {
    notificationStream: new Subject<McsApiJob>(),
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
  let mockMcsApiService = {
    get(apiRequest: McsApiRequestParameter): Observable<Response> {
      return Observable.of(new Response());
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        StateChangeNotificationsComponent,
        TestComponent
      ],
      providers: [
        McsNotificationContextService,
        { provide: McsApiService, useValue: mockMcsApiService },
        { provide: McsNotificationJobService, useValue: mockMcsNotificationJobService },
        { provide: McsAssetsProvider, useValue: mockAssetsProvider },
        { provide: McsBrowserService, useValue: mockMcsBrowserService }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(StateChangeNotificationsComponent, {
      set: {
        template: `
        <div #stateChangeNotificationsElement class="state-change-notifications-container">
          <ul class="unstyled-list">
            <li *ngFor="let notification of notifications">
              <mcs-state-change-notification [attribute]="notification">
              </mcs-state-change-notification>
            </li>
          </ul>
        </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(StateChangeNotificationsComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
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
  describe('ngOnInit()', () => {
    it('should position the notification wrapper to bottom left(initially) by default', () => {
      component.placement = 'left';
      expect(component.stateChangeNotificationsElement.nativeElement.style.left).toContain('px');
      expect(component.stateChangeNotificationsElement.nativeElement.style.right)
        .not.toContain('px');
    });
  });

  describe('setPlacement()', () => {
    it('should position the notification wrapper to bottom left', () => {
      component.placement = 'left';
      component.setPlacement();
      expect(component.stateChangeNotificationsElement.nativeElement.style.left).toContain('px');
      expect(component.stateChangeNotificationsElement.nativeElement.style.right)
        .not.toContain('px');
    });

    it('should position the notification wrapper to bottom right', () => {
      component.placement = 'right';
      component.setPlacement();
      expect(component.stateChangeNotificationsElement.nativeElement.style.right).toContain('px');
    });
  });

  describe('notificationsStream()', () => {
    it('should get the notifications from the notification context service',
      fakeAsync((inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {

          let notifications: McsApiJob[] = new Array();

          let job = new McsApiJob();
          job.status = CoreDefinition.NOTIFICATION_JOB_FAILED;
          notifications.push(job);

          job = new McsApiJob();
          job.status = CoreDefinition.NOTIFICATION_JOB_TIMEDOUT;
          notifications.push(job);

          job = new McsApiJob();
          job.status = CoreDefinition.NOTIFICATION_JOB_CANCELLED;
          notifications.push(job);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(3);
        }))));
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe to notificationsSubscription', () => {
      spyOn(component.notificationsSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.notificationsSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe to browserSubscription', () => {
      spyOn(component.browserSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.browserSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});

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
import { StateChangeNotificationsComponent } from './state-change-notifications.component';
import {
  McsApiJob,
  McsJobStatus,
  McsNotificationContextService,
  CoreDefinition
} from '../../core';
import { CoreLayoutTestingModule } from '../testing';

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

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        StateChangeNotificationsComponent,
        TestComponent
      ],
      imports: [
        CoreLayoutTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(StateChangeNotificationsComponent, {
      set: {
        template: `
        <div>StateChangeNotificationsComponent Template</div>
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
          job.status = McsJobStatus.Failed;
          notifications.push(job);

          job = new McsApiJob();
          job.status = McsJobStatus.Timedout;
          notifications.push(job);

          job = new McsApiJob();
          job.status = McsJobStatus.Cancelled;
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
  });
});

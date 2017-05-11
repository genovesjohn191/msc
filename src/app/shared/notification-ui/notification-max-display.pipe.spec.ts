import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { NotificationMaxDisplayPipe } from './notification-max-display.pipe';
import {
  McsNotification,
  CoreDefinition
} from '../../core';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  public notifications: McsNotification[];

  constructor() {
    this.notifications = new Array();
    this.populateNotifications();
  }

  public populateNotifications() {
    this.notifications.push(new McsNotification());
    this.notifications.push(new McsNotification());
    this.notifications.push(new McsNotification());
    this.notifications.push(new McsNotification());
  }
}

describe('NotificationMaxDisplayPipe', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let divElements: any;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        NotificationMaxDisplayPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <ul>
          <li *ngFor="let notification of (notifications | mcsNotificationMaxDisplay)">
            <div>Notification</div>
          </li>
        </ul>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
      divElements = fixtureInstance.nativeElement.querySelectorAll('div');
    });
  }));

  /** Test Implementation */
  describe('notifications()', () => {
    it(`should create/display ${CoreDefinition.NOTIFICATION_MAX_DISPLAY} notifications only`,
      () => {
        expect(divElements.length).toBe(CoreDefinition.NOTIFICATION_MAX_DISPLAY);
      });
  });
});

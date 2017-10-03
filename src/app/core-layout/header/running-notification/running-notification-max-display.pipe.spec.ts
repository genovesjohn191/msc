import {
  async,
  TestBed
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { RunningNotificationMaxDisplayPipe } from './running-notification-max-display.pipe';
import {
  McsApiJob,
  CoreDefinition
} from '../../../core';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  public notifications: McsApiJob[];

  constructor() {
    this.notifications = new Array();
    this.populateNotifications();
  }

  public populateNotifications() {
    this.notifications.push(new McsApiJob());
    this.notifications.push(new McsApiJob());
    this.notifications.push(new McsApiJob());
    this.notifications.push(new McsApiJob());
  }
}

describe('RunningNotificationMaxDisplayPipe', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let divElements: any;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        RunningNotificationMaxDisplayPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <ul>
          <li *ngFor="let notification of (notifications | mcsRunningNotificationMaxDisplayPipe)">
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
    it(`should create/display ${CoreDefinition.NOTIFICATION_RUNNING_MAX_DISPLAY}
    notifications only`,
      () => {
        expect(divElements.length).toBe(CoreDefinition.NOTIFICATION_RUNNING_MAX_DISPLAY);
      });
  });
});

import {
  async,
  TestBed,
} from '@angular/core/testing';
import {
  Component,
  Input
} from '@angular/core';
import { StateChangeNotificationsComponent } from './state-change-notifications.component';
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
              <div>{{ notification }}</div>
            </li>
          </ul>
        </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(StateChangeNotificationsComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.ngOnInit();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should position the notification wrapper to bottom left(initially) by default', () => {
      component.placement = 'left';
      expect(component.stateChangeNotificationsElement.nativeElement.style.left).toContain('px');
      expect(component.stateChangeNotificationsElement.nativeElement.style.right).not.toContain('px');
    });
  });

  describe('setPlacement()', () => {
    it('should position the notification wrapper to bottom left', () => {
      component.placement = 'left';
      component.setPlacement();
      expect(component.stateChangeNotificationsElement.nativeElement.style.left).toContain('px');
      expect(component.stateChangeNotificationsElement.nativeElement.style.right).not.toContain('px');
    });

    it('should position the notification wrapper to bottom right', () => {
      component.placement = 'right';
      component.setPlacement();
      expect(component.stateChangeNotificationsElement.nativeElement.style.right).toContain('px');
    });
  });
});

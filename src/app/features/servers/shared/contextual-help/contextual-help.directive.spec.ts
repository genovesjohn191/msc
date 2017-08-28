import {
  async,
  inject,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import {
  Component,
  DebugElement,
  ViewChild
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { ContextualHelpDirective } from './contextual-help.directive';
import { ServersTestingModule } from '../../testing';
import {
  McsBrowserService,
  McsDeviceType
} from '../../../../core';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(ContextualHelpDirective)
  public contextualHelp: ContextualHelpDirective;
}

describe('ContextualHelpDirective', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let directiveElement: DebugElement;
  let browserService: McsBrowserService;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        ContextualHelpDirective
      ],
      imports: [
        ServersTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <span mcsContextualHelp="Hi"> Hello World! :)</span>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
      directiveElement = fixtureInstance.debugElement.query(By.directive(ContextualHelpDirective));
      browserService = getTestBed().get(McsBrowserService);

      // Force the devicestream to set in Desktop mode
      browserService.deviceTypeStream.next(McsDeviceType.Desktop);
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should call the subscribe of deviceTypeStream from McsBrowserService`, () => {
      spyOn(browserService.deviceTypeStream, 'subscribe');
      component.contextualHelp.ngOnInit();
      expect(browserService.deviceTypeStream.subscribe).toHaveBeenCalled();
    });
  });

  describe('ContextualHelpDirective()', () => {
    it(`should set the contextual help message`, () => {
      expect(component.contextualHelp.mcsContextualHelp).toBe('Hi');
    });
  });

  describe('mouseenter()', () => {
    it(`should set has focus flag to true when mouseenter is triggered`, () => {
      directiveElement.triggerEventHandler('mouseenter', {});
      expect(component.contextualHelp.hasFocus).toBeTruthy();
    });
  });

  describe('mouseleave()', () => {
    it(`should set has focus false to true when mouseleave is triggered`, () => {
      directiveElement.triggerEventHandler('mouseleave', {});
      expect(component.contextualHelp.hasFocus).toBeFalsy();
    });
  });
});

import {
  async,
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
import {
  McsBrowserService,
  McsDeviceType
} from '../../core';
import { triggerEvent } from '../../utilities';
import { CoreTestingModule } from '../../core/testing';

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
  let fixtureInstance: any;
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
        CoreTestingModule
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
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
      directiveElement = fixtureInstance.debugElement.query(By.directive(ContextualHelpDirective));
      browserService = getTestBed().get(McsBrowserService);

      // Force the devicestream to set in Desktop mode
      browserService.deviceTypeStream.next(McsDeviceType.Desktop);
    });
  }));

  /** Test Implementation */
  describe('ContextualHelpDirective()', () => {
    it(`should set the contextual help message`, () => {
      expect(component.contextualHelp.mcsContextualHelp).toBe('Hi');
    });
  });

  describe('focusIn()', () => {
    it(`should set has focus flag to true when focusin is triggered`, () => {
      triggerEvent(directiveElement.nativeElement, 'focusin');
      expect(component.contextualHelp.hasFocus).toBeTruthy();
    });
  });

  describe('focusOut()', () => {
    it(`should set has focus false to true when focusout is triggered`, () => {
      triggerEvent(directiveElement.nativeElement, 'focusout');
      expect(component.contextualHelp.hasFocus).toBeFalsy();
    });
  });
});

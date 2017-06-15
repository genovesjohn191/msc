import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import {
  Component,
  DebugElement,
  ViewChild
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { ContextualHelpDirective } from './contextual-help.directive';

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

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        ContextualHelpDirective
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
    });
  }));

  /** Test Implementation */
  describe('ContextualHelpDirective()', () => {
    it(`should set the contextual help message`, () => {
      expect(component.contextualHelp.mcsContextualHelp).toBe('Hi');
    });
  });

  describe('mouseenter() | focusin()', () => {
    it(`should set has focus flag to true when mouseenter is triggered`, () => {
      directiveElement.triggerEventHandler('mouseenter', {});
      expect(component.contextualHelp.hasFocus).toBeTruthy();
    });

    it(`should set has focus flag to true when focusin is triggered`, () => {
      directiveElement.triggerEventHandler('focusin', {});
      expect(component.contextualHelp.hasFocus).toBeTruthy();
    });
  });

  describe('mouseleave() | focusout()', () => {
    it(`should set has focus false to true when mouseleave is triggered`, () => {
      directiveElement.triggerEventHandler('mouseleave', {});
      expect(component.contextualHelp.hasFocus).toBeFalsy();
    });

    it(`should set has focus flag to false when focusout is triggered`, () => {
      directiveElement.triggerEventHandler('focusout', {});
      expect(component.contextualHelp.hasFocus).toBeFalsy();
    });
  });
});

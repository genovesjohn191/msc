import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';
import { triggerEvent } from '@app/utilities';

import { ContextualHelpDirective } from './contextual-help.directive';
import { ContextualHelpModule } from './contextual-help.module';

@Component({
  selector: 'mcs-test-contextualhelp',
  template: ``
})
export class TestContextualHelpComponent {
  @ViewChild(ContextualHelpDirective, { static: false })
  public contextual: ContextualHelpDirective;
}

describe('ContextualHelpDirective', () => {

  /** Stub Services/Components */
  let component: TestContextualHelpComponent;
  let buttonElement: any;
  let fixtureInstance: ComponentFixture<TestContextualHelpComponent>;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestContextualHelpComponent
      ],
      imports: [
        CoreTestingModule,
        ContextualHelpModule
      ]
    });

    /** Testbed Overriding of Components */
    TestBed.overrideComponent(TestContextualHelpComponent, {
      set: {
        template: `
        <button mcsContextualHelp="Something">TooltipDirective Template</button>
        <input id="placement"/>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestContextualHelpComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
      buttonElement = fixtureInstance.nativeElement.querySelector('button');
    });
  }));

  /** Test Implementation */
  describe('hover() Event', () => {
    beforeEach(waitForAsync(() => {
      component.contextual.ngOnInit();
      triggerEvent(buttonElement, 'mouseenter');
      fixtureInstance.detectChanges();
    }));

    it(`should open/create the contextual help when the implemented element was hover`, () => {
      let elementExist = document.querySelector('mcs-contextual-help');
      expect(elementExist).not.toBe(null);
    });
  });
});

import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import {
  Component,
  ViewChild
} from '@angular/core';
import { triggerEvent } from '../../utilities';

import { ContextualHelpDirective } from './contextual-help.directive';
import { ContextualHelpModule } from './contextual-help.module';
import { CoreTestingModule } from '../../core/testing';

@Component({
  selector: 'mcs-test-contextualhelp',
  template: ``
})
export class TestContextualHelpComponent {
  @ViewChild(ContextualHelpDirective)
  public contextual: ContextualHelpDirective;
}

describe('ContextualHelpDirective', () => {

  /** Stub Services/Components */
  let component: TestContextualHelpComponent;
  let buttonElement: any;
  let fixtureInstance: ComponentFixture<TestContextualHelpComponent>;

  beforeEach(async(() => {
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
  describe('focus() Event', () => {
    beforeEach(async(() => {
      component.contextual.ngOnInit();
      triggerEvent(buttonElement, 'focus');
      fixtureInstance.detectChanges();
    }));

    it(`should open/create the contextual help when the implemented element is on focus`, () => {
      let elementExist = document.querySelector('mcs-contextual-help');
      expect(elementExist).not.toBe(null);
    });
  });
});

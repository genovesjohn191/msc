import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import {
  Component,
  ViewChild,
  DebugElement
} from '@angular/core';
import { triggerEvent } from '../../utilities';
import { By } from '@angular/platform-browser';

import { TooltipDirective } from './tooltip.directive';
import { TooltipModule } from './tooltip.module';
import { CoreTestingModule } from '../../core/testing';

@Component({
  selector: 'mcs-test-tooltip',
  template: ``
})
export class TestTooltipComponent {
  @ViewChild(TooltipDirective)
  public tooltip: TooltipDirective;
}

describe('TooltipDirective', () => {

  /** Stub Services/Components */
  let component: TestTooltipComponent;
  let directiveElement: DebugElement;
  let buttonElement: any;
  let fixtureInstance: ComponentFixture<TestTooltipComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestTooltipComponent
      ],
      imports: [
        CoreTestingModule,
        TooltipModule
      ]
    });

    /** Testbed Overriding of Components */
    TestBed.overrideComponent(TestTooltipComponent, {
      set: {
        template: `
        <div>TooltipDirective Template</div>
        <button class="btn btn-primary"
          mcsTooltip="Tooltip!"></button>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestTooltipComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
      directiveElement = fixtureInstance.debugElement.query(By.directive(TooltipDirective));
      buttonElement = fixtureInstance.nativeElement.querySelector('button');
    });
  }));

  /** Test Implementation */
  describe('mouseenter:mouseleave() Event', () => {
    beforeEach(async(() => {
      component.tooltip.ngOnInit();
      triggerEvent(buttonElement, 'mouseenter');
      fixtureInstance.detectChanges();
    }));

    it(`should open/create the tooltip when the implemented element is hovered`, () => {
      let elementExist = document.querySelector('mcs-tooltip');
      expect(elementExist).not.toBe(null);
    });

    // TODO: This unit test is still bug in angular v4.2.4, try to uncomment this
    // test when the version is up.

    // it(`should close/delete the tooltip when the implemented element is not focused`, () => {
    //   triggerEvent(directiveElement.nativeElement, 'mouseleave');
    //   fixtureInstance.detectChanges();
    //   let elementExist = document.querySelector('mcs-tooltip');
    //   expect(elementExist).toBe(null);
    // });

    // it(`should close/delete the tooltip when the implemented element is not clicked`, () => {
    //   triggerEvent(directiveElement.nativeElement, 'click');
    //   fixtureInstance.detectChanges();
    //   let elementExist = document.querySelector('mcs-tooltip');
    //   expect(elementExist).toBe(null);
    // });
  });
});

import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import {
  Component,
  ViewChild
} from '@angular/core';
import { triggerEvent } from '@app/utilities';

import { TooltipDirective } from './tooltip.directive';
import { TooltipModule } from './tooltip.module';
import { CoreTestingModule } from '@app/core/testing';

@Component({
  selector: 'mcs-test-tooltip',
  template: ``
})
export class TestTooltipComponent {
  @ViewChild(TooltipDirective, { static: false })
  public tooltip: TooltipDirective;
}

describe('TooltipDirective', () => {

  /** Stub Services/Components */
  let component: TestTooltipComponent;
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
  });
});

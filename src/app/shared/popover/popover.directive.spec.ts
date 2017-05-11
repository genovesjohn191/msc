import {
  async,
  inject,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import {
  Component,
  ViewChild,
  ComponentRef,
  DebugElement
} from '@angular/core';
import { By } from '@angular/platform-browser';

import { PopoverComponent } from './popover.component';
import { PopoverDirective } from './popover.directive';
import { PopoverModule } from './popover.module';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(PopoverDirective)
  public popover: PopoverDirective;
}

describe('PopoverDirective', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let directiveElement: DebugElement;
  let buttonElement: any;
  let fixtureInstance: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent
      ],
      imports: [
        PopoverModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <ng-template #popoverTitle>
          <span>Popover Title</span>
        </ng-template>
        <ng-template #popoverContent>
          <span>Popover Content</span>
        </ng-template>

        <button class="btn btn-primary" mcsPopover #popover="mcsPopover"
          theme="light" trigger="manual" elementContainer="default"
          title="popoverTitle" [content]="popoverContent"
          placement="bottom" orientation="center">Light</button><br/>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
      directiveElement = fixtureInstance.debugElement.query(By.directive(PopoverDirective));
      buttonElement = fixtureInstance.nativeElement.querySelector('button');
    });
  }));

  /** Test Implementation */
  describe('click() Event', () => {
    beforeEach(async(() => {
      directiveElement.triggerEventHandler('click', {});
    }));

    it(`should open/create the popover when click is triggered first time`, () => {
      let mcsPopoverExist = fixtureInstance.nativeElement.querySelector('mcs-popover');
      expect(mcsPopoverExist).not.toBe(null);
    });

    it(`should close/delete the popover when click is triggered second time`, () => {
      directiveElement.triggerEventHandler('click', {});
      let mcsPopoverExist = fixtureInstance.nativeElement.querySelector('mcs-popover');
      expect(mcsPopoverExist).toBe(null);
    });
  });

  describe('mouseenter:mouseleave() Event', () => {
    beforeEach(async(() => {
      component.popover.trigger = 'hover';
      directiveElement.triggerEventHandler('mouseenter', {});
    }));

    it(`should open/create the popover when 'mouseenter' is invoked`, () => {
      let mcsPopoverExist = fixtureInstance.nativeElement.querySelector('mcs-popover');
      expect(mcsPopoverExist).not.toBe(null);
    });

    it(`should close/delete the popover when 'mouseleave' is invoked`, () => {
      directiveElement.triggerEventHandler('mouseleave', {});
      let mcsPopoverExist = fixtureInstance.nativeElement.querySelector('mcs-popover');
      expect(mcsPopoverExist).toBe(null);
    });
  });

  describe('focusin:focusout() Event', () => {
    beforeEach(async(() => {
      component.popover.trigger = 'hover';
      directiveElement.triggerEventHandler('focusin', {});
    }));

    it(`should open/create the popover when 'focusin' event is invoked`, () => {
      let mcsPopoverExist = fixtureInstance.nativeElement.querySelector('mcs-popover');
      expect(mcsPopoverExist).not.toBe(null);
    });

    it(`should close/delete the popover when 'focusout' event is invoked`, () => {
      directiveElement.triggerEventHandler('focusout', {});
      let mcsPopoverExist = fixtureInstance.nativeElement.querySelector('mcs-popover');
      expect(mcsPopoverExist).toBe(null);
    });
  });

  describe('orientation() of the mcs-popover element', () => {
    let elementPosition: ClientRect;
    beforeEach(async(() => {
      component.popover.trigger = 'manual';
      elementPosition = {
        width: 100,
        height: 100,
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      };
      directiveElement.triggerEventHandler('click', {});
    }));

    it(`should set the orientation of mcs-popover element to left`, () => {
      let expectedResult = elementPosition.width * 0.5 - 30;
      component.popover.setLeftOrientation(elementPosition);
      expect(component.popover.componentRef.instance.contentElement.nativeElement.style.left)
        .toBe(`${-expectedResult}px`);
    });

    it(`should set the orientation of mcs-popover element to right`, () => {
      let expectedResult = elementPosition.width * 0.5 - 30;
      component.popover.setRightOrientation(elementPosition);
      expect(component.popover.componentRef.instance.contentElement.nativeElement.style.right)
        .toBe(`${-expectedResult}px`);
    });

    it(`should set the orientation of mcs-popover element to top`, () => {
      let expectedResult = elementPosition.height * 0.5 - 30;
      component.popover.setTopOrientation(elementPosition);
      expect(component.popover.componentRef.instance.contentElement.nativeElement.style.top)
        .toBe(`${-expectedResult}px`);
    });

    it(`should set the orientation of mcs-popover element to bottom`, () => {
      let expectedResult = elementPosition.height * 0.5 - 30;
      component.popover.setBottomOrientation(elementPosition);
      expect(component.popover.componentRef.instance.contentElement.nativeElement.style.bottom)
        .toBe(`${-expectedResult}px`);
    });
  });

  describe('moveElementPosition()', () => {
    let elementPosition: ClientRect;
    beforeEach(async(() => {
      component.popover.trigger = 'manual';
      directiveElement.triggerEventHandler('click', {});
    }));

    it(`should call the setRightOrientation()
      when the placement is top and orientation is right`, () => {
        spyOn(component.popover, 'setRightOrientation');
        component.popover.moveElementPosition('top', 'right');
        expect(component.popover.setRightOrientation).toHaveBeenCalled();
      });

    it(`should call the setLeftOrientation()
      when the placement is top and orientation is left`, () => {
        spyOn(component.popover, 'setLeftOrientation');
        component.popover.moveElementPosition('top', 'left');
        expect(component.popover.setLeftOrientation).toHaveBeenCalled();
      });

    it(`should call the setRightOrientation()
      when the placement is bottom and orientation is right`, () => {
        spyOn(component.popover, 'setRightOrientation');
        component.popover.moveElementPosition('bottom', 'right');
        expect(component.popover.setRightOrientation).toHaveBeenCalled();
      });

    it(`should call the setLeftOrientation()
      when the placement is bottom and orientation is left`, () => {
        spyOn(component.popover, 'setLeftOrientation');
        component.popover.moveElementPosition('bottom', 'left');
        expect(component.popover.setLeftOrientation).toHaveBeenCalled();
      });

    it(`should call the setTopOrientation()
      when the placement is right and orientation is top`, () => {
        spyOn(component.popover, 'setTopOrientation');
        component.popover.moveElementPosition('right', 'top');
        expect(component.popover.setTopOrientation).toHaveBeenCalled();
      });

    it(`should call the setBottomOrientation()
      when the placement is right and orientation is bottom`, () => {
        spyOn(component.popover, 'setBottomOrientation');
        component.popover.moveElementPosition('right', 'bottom');
        expect(component.popover.setBottomOrientation).toHaveBeenCalled();
      });

    it(`should call the setTopOrientation()
      when the placement is left and orientation is top`, () => {
        spyOn(component.popover, 'setTopOrientation');
        component.popover.moveElementPosition('left', 'top');
        expect(component.popover.setTopOrientation).toHaveBeenCalled();
      });

    it(`should call the setBottomOrientation()
      when the placement is left and orientation is bottom`, () => {
        spyOn(component.popover, 'setBottomOrientation');
        component.popover.moveElementPosition('left', 'bottom');
        expect(component.popover.setBottomOrientation).toHaveBeenCalled();
      });
  });
});

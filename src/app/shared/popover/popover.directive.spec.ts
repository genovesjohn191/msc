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
import { triggerEvent } from '@app/utilities';
import { By } from '@angular/platform-browser';

import { PopoverDirective } from './popover.directive';
import { PopoverModule } from './popover.module';
import { CoreTestingModule } from '@app/core/testing';

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
  let fixtureInstance: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent
      ],
      imports: [
        CoreTestingModule,
        PopoverModule
      ]
    });

    /** Testbed Overriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>PopoverDirective Template</div>
        <ng-template #popoverTitle>
          <span>Popover Title</span>
        </ng-template>
        <ng-template #popoverContent>
          <span>Popover Content</span>
        </ng-template>

        <button class="btn btn-primary" mcsPopover #popover="mcsPopover"
          theme="light" trigger="manual"
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
    });
  }));

  /** Test Implementation */
  describe('click() Event', () => {
    beforeEach(async(() => {
      triggerEvent(directiveElement.nativeElement, 'click');
      fixtureInstance.detectChanges();
    }));

    it(`should open/create the popover when click is triggered first time`, () => {
      let mcsPopoverExist = document.querySelector('mcs-popover');
      expect(mcsPopoverExist).not.toBe(null);
    });

    it(`should close/delete the popover when click is triggered second time`, () => {
      triggerEvent(directiveElement.nativeElement, 'click');
      fixtureInstance.detectChanges();
      let mcsPopoverExist = document.querySelector('mcs-popover');
      expect(mcsPopoverExist).toBe(null);
    });
  });

  describe('mouseenter:mouseleave() Event', () => {
    beforeEach(async(() => {
      component.popover.trigger = 'hover';
      component.popover.ngOnInit();
      triggerEvent(directiveElement.nativeElement, 'mouseenter');
      fixtureInstance.detectChanges();
    }));

    it(`should open/create the popover when 'mouseenter' is invoked`, () => {
      let mcsPopoverExist = document.querySelector('mcs-popover');
      expect(mcsPopoverExist).not.toBe(null);
    });

    it(`should close/delete the popover when 'mouseleave' is invoked`, () => {
      triggerEvent(directiveElement.nativeElement, 'mouseleave');
      fixtureInstance.detectChanges();
      let mcsPopoverExist = document.querySelector('mcs-popover');
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
      triggerEvent(directiveElement.nativeElement, 'click');
    }));

    it(`should set the orientation of mcs-popover element to left`, () => {
      let expectedResult = elementPosition.width * 0.5 - 20;
      component.popover.setLeftOrientation(elementPosition);
      expect(component.popover.componentRef.instance.contentElement.nativeElement.style.left)
        .toBe(`${-expectedResult}px`);
    });

    it(`should set the orientation of mcs-popover element to right`, () => {
      let expectedResult = elementPosition.width * 0.5 - 20;
      component.popover.setRightOrientation(elementPosition);
      expect(component.popover.componentRef.instance.contentElement.nativeElement.style.right)
        .toBe(`${-expectedResult}px`);
    });

    it(`should set the orientation of mcs-popover element to top`, () => {
      let expectedResult = elementPosition.height * 0.5 - 20;
      component.popover.setTopOrientation(elementPosition);
      expect(component.popover.componentRef.instance.contentElement.nativeElement.style.top)
        .toBe(`${-expectedResult}px`);
    });

    it(`should set the orientation of mcs-popover element to bottom`, () => {
      let expectedResult = elementPosition.height * 0.5 - 20;
      component.popover.setBottomOrientation(elementPosition);
      expect(component.popover.componentRef.instance.contentElement.nativeElement.style.bottom)
        .toBe(`${-expectedResult}px`);
    });
  });

  describe('moveElementPosition()', () => {
    beforeEach(async(() => {
      component.popover.trigger = 'manual';
      triggerEvent(directiveElement.nativeElement, 'click');
    }));

    it(`should call the setRightOrientation()
      when the placement is top and orientation is right`, () => {
        spyOn(component.popover, 'setRightOrientation');
        component.popover.placement = 'top';
        component.popover.moveElementPosition('right');
        expect(component.popover.setRightOrientation).toHaveBeenCalled();
      });

    it(`should call the setLeftOrientation()
      when the placement is top and orientation is left`, () => {
        spyOn(component.popover, 'setLeftOrientation');
        component.popover.placement = 'top';
        component.popover.moveElementPosition('left');
        expect(component.popover.setLeftOrientation).toHaveBeenCalled();
      });

    it(`should call the setRightOrientation()
      when the placement is bottom and orientation is right`, () => {
        spyOn(component.popover, 'setRightOrientation');
        component.popover.placement = 'bottom';
        component.popover.moveElementPosition('right');
        expect(component.popover.setRightOrientation).toHaveBeenCalled();
      });

    it(`should call the setLeftOrientation()
      when the placement is bottom and orientation is left`, () => {
        spyOn(component.popover, 'setLeftOrientation');
        component.popover.placement = 'bottom';
        component.popover.moveElementPosition('left');
        expect(component.popover.setLeftOrientation).toHaveBeenCalled();
      });

    it(`should call the setTopOrientation()
      when the placement is right and orientation is top`, () => {
        spyOn(component.popover, 'setTopOrientation');
        component.popover.placement = 'right';
        component.popover.moveElementPosition('top');
        expect(component.popover.setTopOrientation).toHaveBeenCalled();
      });

    it(`should call the setBottomOrientation()
      when the placement is right and orientation is bottom`, () => {
        spyOn(component.popover, 'setBottomOrientation');
        component.popover.placement = 'right';
        component.popover.moveElementPosition('bottom');
        expect(component.popover.setBottomOrientation).toHaveBeenCalled();
      });

    it(`should call the setTopOrientation()
      when the placement is left and orientation is top`, () => {
        spyOn(component.popover, 'setTopOrientation');
        component.popover.placement = 'left';
        component.popover.moveElementPosition('top');
        expect(component.popover.setTopOrientation).toHaveBeenCalled();
      });

    it(`should call the setBottomOrientation()
      when the placement is left and orientation is bottom`, () => {
        spyOn(component.popover, 'setBottomOrientation');
        component.popover.placement = 'left';
        component.popover.moveElementPosition('bottom');
        expect(component.popover.setBottomOrientation).toHaveBeenCalled();
      });
  });
});

import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { Key } from '@app/models';
import {
  createKeyboardEvent,
  createMouseEvent,
  triggerEvent
} from '@app/utilities';

import { SliderComponent } from './slider.component';
import { SliderModule } from './slider.module';

@Component({
  selector: 'mcs-test-slider',
  template: ``
})
export class SliderTestComponent {
  @ViewChild(SliderComponent)
  public sliderComponent: SliderComponent;
}

describe('SliderComponent', () => {

  /** Stub Services/Components */
  let component: SliderTestComponent;
  let padding: number = 8; // padding of the slider component

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        SliderTestComponent
      ],
      imports: [
        SliderModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(SliderTestComponent, {
      set: {
        template: `
        <mcs-slider
          [ngStyle]="{width: '200px', height: '200px',
          position: 'absolute', left: '0', top: '0', padding: '0' }"
          orientation="horizontal" [showTicks]="true"
          [min]="0" [max]="200" [step]="10" [showLabel]="true">
        </mcs-slider>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(SliderTestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should set the orientation to horizontal`, () => {
      expect(component.sliderComponent.orientation).toBe('horizontal');
    });

    it(`should set the minimum to 0`, () => {
      expect(component.sliderComponent.min).toBe(0);
    });

    it(`should set the maximum to 200`, () => {
      expect(component.sliderComponent.max).toBe(200);
    });

    it(`should set the step to 10`, () => {
      expect(component.sliderComponent.step).toBe(10);
    });

    it(`should set the showTicks flag to true`, () => {
      expect(component.sliderComponent.showTicks).toBeTruthy();
    });

    it(`should set the showLabel flag to true`, () => {
      expect(component.sliderComponent.showLabel).toBeTruthy();
    });
  });

  describe('onClick()', () => {
    beforeEach(waitForAsync(() => {
      triggerEvent(component.sliderComponent.hostElement, 'mouseenter');
    }));

    it(`should call the onClick() method when mouse is clicked`, () => {
      let event = createMouseEvent('click', 10, 5);
      spyOn(component.sliderComponent, 'onClick');
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.onClick).toHaveBeenCalled();
    });

    it(`should set the value to 10 when mouse is clicked to 10th position`, () => {
      let event = createMouseEvent('click', (10 + padding), (5 + padding));
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(10);
    });

    it(`should set the value to max when mouse is clicked @ the last position`, () => {
      let event = createMouseEvent('click', (195 + padding), (5 + padding));
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(200);
    });
  });

  describe('onSlideStart()', () => {
    beforeEach(waitForAsync(() => {
      triggerEvent(component.sliderComponent.hostElement, 'mouseenter');
    }));

    it(`should call the onSlideStart() method when mouse started sliding`, () => {
      let event = createMouseEvent('mousedown', 10, 5);
      spyOn(component.sliderComponent, 'onSlideStart');
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.onSlideStart).toHaveBeenCalled();
    });

    it(`should set the value to 10 when mouse is slides to more than 5th position`, () => {
      let event = createMouseEvent('mousedown', (5 + padding), (5 + padding));
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(10);
    });

    it(`should set the value to max when mouse is slided @ the last position`, () => {
      let event = createMouseEvent('mousedown', (195 + padding), (5 + padding));
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(200);
    });
  });

  describe('onSlide()', () => {
    beforeEach(waitForAsync(() => {
      triggerEvent(component.sliderComponent.hostElement, 'mouseenter');
      triggerEvent(component.sliderComponent.hostElement, 'mousedown');
    }));

    it(`should set the value to 10 when mouse is slides to more than 5th position`, () => {
      let event = createMouseEvent('mousemove', (5 + padding), (5 + padding));
      triggerEvent(document, event);
      expect(component.sliderComponent.value).toBe(10);
    });

    it(`should set the value to max when mouse is slided @ the last position`, () => {
      let event = createMouseEvent('mousemove', (195 + padding), (5 + padding));
      triggerEvent(document, event);
      expect(component.sliderComponent.value).toBe(200);
    });
  });

  describe('onSlideEnd()', () => {
    beforeEach(waitForAsync(() => {
      triggerEvent(component.sliderComponent.hostElement, 'mouseenter');
      triggerEvent(component.sliderComponent.hostElement, 'mousedown');
    }));

    it(`should set the value to 10 when mouse is up to more than 5th position`, () => {
      let event = createMouseEvent('mousemove', (15 + padding), (5 + padding));
      triggerEvent(document, event);
      triggerEvent(document, 'mouseup');
      expect(component.sliderComponent.value).toBe(20);
    });

    it(`should set the value to max when mouse is up @ the last position`, () => {
      let event = createMouseEvent('mousemove', (198 + padding), (5 + padding));
      triggerEvent(document, event);
      triggerEvent(document, 'mouseup');
      expect(component.sliderComponent.value).toBe(200);
    });
  });

  describe('onKeyDown()', () => {
    beforeEach(waitForAsync(() => {
      triggerEvent(component.sliderComponent.hostElement, 'mouseenter');
    }));

    it(`should set the value to 10 when right arrow key is pressed`, () => {
      let event = createKeyboardEvent(Key.RightArrow);
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(10);
    });

    it(`should set the value to 10 when up arrow key is pressed`, () => {
      let event = createKeyboardEvent(Key.UpArrow);
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(10);
    });

    it(`should set the value to 0 when left arrow key is pressed`, () => {
      let event = createKeyboardEvent(Key.LeftArrow);
      component.sliderComponent.value = 10;
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(0);
    });

    it(`should set the value to 0 when down arrow key is pressed`, () => {
      let event = createKeyboardEvent(Key.LeftArrow);
      component.sliderComponent.value = 10;
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(0);
    });

    it(`should increment the value by 10 when page up key is pressed`, () => {
      let event = createKeyboardEvent(Key.PageUp);
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(100);
    });

    it(`should decrement the value by 10 when page down key is pressed`, () => {
      let event = createKeyboardEvent(Key.PageDown);
      component.sliderComponent.value = component.sliderComponent.max;
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(100);
    });

    it(`should set the value to maximum when end key is pressed`, () => {
      let event = createKeyboardEvent(Key.End);
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(component.sliderComponent.max);
    });

    it(`should set the value to minimum when home key is pressed`, () => {
      let event = createKeyboardEvent(Key.Home);
      triggerEvent(component.sliderComponent.hostElement, event);
      expect(component.sliderComponent.value).toBe(component.sliderComponent.min);
    });
  });
});

import {
  async,
  TestBed
} from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import {
  ProgressBarComponent,
  PERCENTAGE_OFFSET
} from './progress-bar.component';

describe('ProgressBarComponent', () => {
  const filterText: string = 'text';

  /** Stub Services/Components */
  let component: ProgressBarComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ProgressBarComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ProgressBarComponent, {
      set: {
        template: `<div>ProgressBarComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ProgressBarComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.registerOnChange((_: any) => { return; });
      component.registerOnTouched(() => { return; });
    });
  }));

  /** Test Implementation */
  describe('getValueInRange()', () => {
    it('should get the value based on inputed range', () => {
      component.value = 100;
      component.maxValue = 100;
      let actualValue = component.getValueInRange();
      expect(actualValue).toBe(100);
    });
  });

  describe('getPercentage()', () => {
    it('should get the percentage based on the value and maximum inputted', () => {
      component.value = 25;
      component.maxValue = 100;
      let actualPercent = component.getPercentage();
      expect(actualPercent).toBe(`${(component.value / component.maxValue) * 100}%`);
    });
  });

  describe('getStyle()', () => {
    let actualStyle;
    beforeEach(() => {
      component.value = 25;
      component.maxValue = 100;
      actualStyle = component.getStyle();
    });

    it('should get the style transform of the percentage label', () => {
      expect(actualStyle.transform)
        .toBe(`translateX(${component.getPercentage()}) translateX(${PERCENTAGE_OFFSET}px)`);
    });
  });

  describe('writeValue()', () => {
    it('should set the inputted value to 100', () => {
      component.writeValue(100);
      expect(component.value).toBe(100);
    });
  });
});

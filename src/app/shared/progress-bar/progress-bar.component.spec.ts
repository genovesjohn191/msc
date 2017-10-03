import {
  async,
  TestBed
} from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {

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

  describe('writeValue()', () => {
    it('should set the inputted value to 100', () => {
      component.writeValue(100);
      expect(component.value).toBe(100);
    });
  });
});

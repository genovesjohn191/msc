import {
  async,
  TestBed
} from '@angular/core/testing';
import { CapacityBarComponent } from './capacity-bar.component';

describe('CapacityBarComponent', () => {

  /** Stub Services/Components */
  let component: CapacityBarComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        CapacityBarComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(CapacityBarComponent, {
      set: {
        template: `<div>Capacity Bar Component Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(CapacityBarComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.registerOnChange((_: any) => { return; });
      component.registerOnTouched(() => { return; });
    });
  }));

  /** Test Implementation */
  describe('writeValue()', () => {
    it('should set the inputted value to 100', () => {
      component.writeValue(75);
      expect(component.value).toBe(75);
    });

    it('should get the percentage based on the provided value and max', () => {
      component.max = 100;
      component.writeValue(75);
      expect(component.percentage).toBe(`${(component.value / component.max) * 100}%`);
    });

    it('should set isLow to true if value is greater than or equal to 85', () => {
      component.max = 100;
      component.writeValue(90);
      expect(component.isLow).toBeTruthy();
    });
  });
});

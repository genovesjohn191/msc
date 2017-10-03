import {
  async,
  TestBed
} from '@angular/core/testing';

import { SliderComponent } from './slider.component';

describe('SliderComponent', () => {

  /** Stub Services/Components */
  let component: SliderComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        SliderComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(SliderComponent, {
      set: {
        template: `
          <div>
            SliderComponent Template
            <input type="range" />
          </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(SliderComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  describe('writeValue()', () => {
    it('should pass the value of slider to sliderValue', () => {
      component.writeValue(300);
      expect(component.sliderValue).toEqual(300);
    });
  });
});

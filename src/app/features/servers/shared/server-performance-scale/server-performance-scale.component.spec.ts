import {
  async,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { ServerPerformanceScaleComponent } from './server-performance-scale.component';
import { ServerInputManageType } from '../../models';

describe('ServerPerformanceScaleComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: ServerPerformanceScaleComponent;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerPerformanceScaleComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerPerformanceScaleComponent, {
      set: {
        template: `
        <div> PerformanceScaleComponent Template </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ServerPerformanceScaleComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.availableMemoryMB = 8192;
      component.availableCpuCount = 4;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit() when the inputted RAM and CPU Count exist in the definition list', () => {
    beforeEach(async(() => {
      component.memoryMB = 4096;
      component.cpuCount = 2;
      component.sliderValue = -1;
      component.ngOnInit();
    }));

    it(`should set the progressbar minimum value to 0`, () => {
      expect(component.minimum).toBe(0);
    });

    it(`should set the progressbar maximum value to 9`, () => {
      expect(component.maximum).toBe(component.sliderTable.length - 1);
    });

    it(`should set the slider value to 1`, () => {
      expect(component.sliderValue).toBe(1);
    });

    it(`should set the scale type to Slider`, () => {
      expect(component.inputManageType).toBe(ServerInputManageType.Slider);
    });
  });

  describe(`ngOnInit() when the inputted RAM and CPU Count not exist in the definition list`,
    () => {
      beforeEach(async(() => {
        component.memoryMB = 4096;
        component.cpuCount = 3;
        component.sliderValue = -1;
        component.ngOnInit();
      }));

      it(`should set the progressbar minimum value to 0`, () => {
        expect(component.minimum).toBe(0);
      });

      it(`should set the progressbar maximum value to 9`, () => {
        expect(component.maximum).toBe(component.sliderTable.length - 1);
      });

      it(`should set the slider value to 0`, () => {
        expect(component.sliderValue).toBe(0);
      });

      it(`should set the scale type to Custom`, () => {
        expect(component.inputManageType).toBe(ServerInputManageType.Custom);
      });
    });

  describe('getMemoryInGb()', () => {
    it(`should calculate the memory in GB with exact values
    when the memory in MB is not exact`, () => {
        let memoryInMb = 1025;
        let memoryInGb = component.getMemoryInGb(memoryInMb);
        expect(memoryInGb).toBe(1);
      });

    it(`should calculate the memory in GB with exact values
    when the memory in MB is not exact`, () => {
        let memoryInMb = 1024;
        let memoryInGb = component.getMemoryInGb(memoryInMb);
        expect(memoryInGb).toBe(1);
      });
  });

  describe('onSliderChanged()', () => {
    it(`should change the slider value based on the inputted index
    and notify the output parameter`, () => {
        spyOn(component.scaleChanged, 'next');
        component.onSliderChanged(1);
        expect(component.sliderValue).toBe(1);
        expect(component.scaleChanged.next).toHaveBeenCalledTimes(1);
      });
  });

  describe('onMemoryChanged()', () => {
    it(`should change the custom memory in GB based on the inputted index
    and notify the output parameter`, () => {
        spyOn(component.scaleChanged, 'next');
        component.onMemoryChanged(2);
        expect(component.customMemoryGBValue).toBe(2);
        expect(component.scaleChanged.next).toHaveBeenCalledTimes(1);
      });
  });

  describe('onCpuCountChanged()', () => {
    it(`should change the custom CPU count based on the inputted index
    and notify the output parameter`, () => {
        spyOn(component.scaleChanged, 'next');
        component.onCpuCountChanged(3);
        expect(component.customCpuCountValue).toBe(3);
        expect(component.scaleChanged.next).toHaveBeenCalledTimes(1);
      });
  });

  describe('onChangeInputManageType()', () => {
    it(`should change the input manage type to Custom`, fakeAsync(() => {
      component.onChangeInputManageType(ServerInputManageType.Custom);
      tick();
      expect(component.inputManageType).toBe(ServerInputManageType.Custom);
    }));

    it(`should change the input manage type to Slider`, fakeAsync(() => {
      component.onChangeInputManageType(ServerInputManageType.Slider);
      tick();
      expect(component.inputManageType).toBe(ServerInputManageType.Slider);
    }));
  });
});

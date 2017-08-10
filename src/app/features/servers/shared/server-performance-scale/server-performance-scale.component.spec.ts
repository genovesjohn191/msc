import {
  async,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { ServerPerformanceScaleComponent } from './server-performance-scale.component';
import {
  ServerInputManageType,
  ServerPerformanceScale
} from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../../core';

describe('ServerPerformanceScaleComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: ServerPerformanceScaleComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerPerformanceScaleComponent
      ],
      providers: [
        McsTextContentProvider
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

    it(`should set the progressbar minimum value to 0`, fakeAsync(() => {
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.minimum).toBe(0);
    }));

    it(`should set the progressbar maximum value to 9`, fakeAsync(() => {
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.maximum).toBe(component.sliderTable.length - 1);
    }));

    it(`should set the slider value to 1`, fakeAsync(() => {
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.sliderValue).toBe(1);
    }));

    it(`should set the scale type to Slider`, fakeAsync(() => {
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.inputManageType).toBe(ServerInputManageType.Slider);
    }));
  });

  describe(`ngOnInit() when the inputted RAM and CPU Count not exist in the definition list`,
    () => {
      beforeEach(async(() => {
        component.memoryMB = 4096;
        component.cpuCount = 3;
        component.sliderValue = -1;
        component.ngOnInit();
      }));

      it(`should set the progressbar minimum value to 0`, fakeAsync(() => {
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.minimum).toBe(0);
      }));

      it(`should set the progressbar maximum value to 9`, fakeAsync(() => {
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.maximum).toBe(component.sliderTable.length - 1);
      }));

      it(`should set the slider value to 0`, fakeAsync(() => {
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.sliderValue).toBe(0);
      }));

      it(`should set the scale type to Custom`, fakeAsync(() => {
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.inputManageType).toBe(ServerInputManageType.Custom);
      }));
    });

  describe('onSliderChanged()', () => {
    it(`should change the slider value based on the inputted index
    and notify the output parameter`, fakeAsync(() => {
        spyOn(component.scaleChanged, 'next');
        component.onSliderChanged(1);
        expect(component.sliderValue).toBe(1);
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.scaleChanged.next).toHaveBeenCalledTimes(1);
      }));
  });

  describe('onMemoryChanged()', () => {
    it(`should change the custom memory in GB based on the inputted index
    and notify the output parameter`, fakeAsync(() => {
        spyOn(component.scaleChanged, 'next');
        component.onMemoryChanged(2);
        expect(component.customMemoryGBValue).toBe(2);
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.scaleChanged.next).toHaveBeenCalledTimes(1);
      }));
  });

  describe('onCpuCountChanged()', () => {
    it(`should change the custom CPU count based on the inputted index
    and notify the output parameter`, fakeAsync(() => {
        spyOn(component.scaleChanged, 'next');
        component.onCpuCountChanged(3);
        expect(component.customCpuCountValue).toBe(3);
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.scaleChanged.next).toHaveBeenCalledTimes(1);
      }));
  });

  describe('onChangeInputManageType()', () => {
    it(`should change the input manage type to Custom`, fakeAsync(() => {
      component.onChangeInputManageType(ServerInputManageType.Custom);
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.inputManageType).toBe(ServerInputManageType.Custom);
    }));

    it(`should change the input manage type to Slider`, fakeAsync(() => {
      component.sliderTable = new Array();
      component.sliderTable.push({ memoryMB: 2048, cpuCount: 1 } as ServerPerformanceScale);
      component.onChangeInputManageType(ServerInputManageType.Slider);
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.inputManageType).toBe(ServerInputManageType.Slider);
    }));
  });
});

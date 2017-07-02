import {
  async,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { ServerManageStorageComponent } from './server-manage-storage.component';
import { ServerInputManageType } from '../../models';
import {
  CoreDefinition,
  McsList,
  McsListItem
} from '../../../../core';

describe('ServerManageStorageComponent', () => {

  /** Stub Services/Components */
  CoreDefinition.INPUT_TIME = 0;  // Remove delay time
  let fixture: any;
  let component: ServerManageStorageComponent;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerManageStorageComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerManageStorageComponent, {
      set: {
        template: `
        <div> ServerManageStorageComponent Template </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ServerManageStorageComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.memoryInGb = 200;
      component.remainingMemoryInGb = 900;
      component.storageProfiles = new McsList();

      component.storageProfiles.push('Storage Profiles',
        new McsListItem('storageProfile1', 'Storage 1'));
      component.storageProfiles.push('Storage Profiles',
        new McsListItem('storageProfile2', 'Storage 2'));
      component.storageProfiles.push('Storage Profiles',
        new McsListItem('storageProfile3', 'Storage 3'));

      component.ngOnInit();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should set the progressbar minimum value to 0`, () => {
      expect(component.minimum).toBe(0);
    });

    it(`should set the progressbar maximum value to 900`, () => {
      expect(component.maximum).toBe(component.remainingMemoryInGb);
    });

    it(`should set the slider value to 200`, () => {
      expect(component.sliderValue).toBe(component.memoryInGb);
    });
  });

  describe('currentMemory()', () => {
    it(`should get the current memory`, () => {
      expect(component.currentMemory).toBe(component.sliderValue);
    });
  });

  describe('validCustomInput()', () => {
    it(`should return false when the final storage value is not
    in the range of storage memory and available memory`, () => {
      component.customFinalStorageValue = 199;
      expect(component.validCustomInput).toBeFalsy();
    });

    it(`should return false when the final storage value is
    in the range of storage memory and available memory`, () => {
      component.customFinalStorageValue = 500;
      expect(component.validCustomInput).toBeTruthy();
    });
  });

  describe('onSliderChanged()', () => {
    it(`should changed the slider value based on the inputted index
    and notify the output parameter`, () => {
      spyOn(component.storageChanged, 'next');
      component.onSliderChanged(1);
      expect(component.sliderValue).toBe(1);
      expect(component.storageChanged.next).toHaveBeenCalledTimes(1);
    });
  });

  describe('onCustomStorageChanged()', () => {
    it(`should changed the storage value based on the inputted value`, () => {
      spyOn(component.storageChanged, 'next');
      component.customFinalStorageValue = 250;
      component.onCustomStorageChanged(250);
      expect(component.storageChanged.next).toHaveBeenCalledTimes(1);
    });
  });

  describe('onStorageProfileChanged() in case the input manage type is Custom', () => {
    beforeEach(async(() => {
      component.inputManageType = ServerInputManageType.Custom;
    }));

    it(`should changed the storage profile value based on the inputted value`, () => {
      component.onStorageProfileChanged(2);
      expect(component.storageProfileValue).toBe(2);
    });

    it(`should return the custom storage value`, () => {
      expect(component.onStorageProfileChanged(2))
        .toBe(component.customStorageValue);
    });

    it(`should notify the output parameter`, () => {
      spyOn(component.storageChanged, 'next');
      component.onStorageProfileChanged(2);
      expect(component.storageChanged.next).toHaveBeenCalledTimes(1);
    });
  });

  describe('onStorageProfileChanged() in case the input manage type is Slider', () => {
    beforeEach(async(() => {
      component.inputManageType = ServerInputManageType.Slider;
    }));

    it(`should changed the storage profile value based on the inputted value`, () => {
      component.onStorageProfileChanged(2);
      expect(component.storageProfileValue).toBe(2);
    });

    it(`should return the slider value`, () => {
      expect(component.onStorageProfileChanged(2))
        .toBe(component.sliderValue);
    });

    it(`should notify the output parameter`, () => {
      spyOn(component.storageChanged, 'next');
      component.onStorageProfileChanged(2);
      expect(component.storageChanged.next).toHaveBeenCalledTimes(1);
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

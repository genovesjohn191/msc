import {
  async,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { ServerManageStorageComponent } from './server-manage-storage.component';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../../core';
import { ServerInputManageType } from '../../models';
import { FormControl } from '@angular/forms';

describe('ServerManageStorageComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: ServerManageStorageComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerManageStorageComponent
      ],
      providers: [
        McsTextContentProvider
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerManageStorageComponent, {
      set: {
        template: `
        <div>ServerManageStorageComponent Template </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ServerManageStorageComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.memoryMB = 256000;
      component.availableMemoryMB = 102400;

      component.storageProfileList = new Array();
      component.storageProfileList.push({ value: 'storageProfile1', text: 'Storage 1' });
      component.storageProfileList.push({ value: 'storageProfile2', text: 'Storage 2' });
      component.storageProfileList.push({ value: 'storageProfile3', text: 'Storage 3' });

      component.ngOnInit();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should set the storageProfileValue to the first item of storageProfileList`, () => {
      expect(component.storageProfileValue)
        .toBe(component.storageProfileList[0].value);
    });

    it(`should initialize the sliderValue`, fakeAsync(() => {
        spyOn(component.storageChanged, 'next');
        component.ngOnInit();
        expect(component.storageSliderValue).toBe(0);
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.storageChanged.next).toHaveBeenCalledTimes(2);
      }));

    it(`should initialize the customStorageValue`, fakeAsync(() => {
        spyOn(component.storageChanged, 'next');
        component.ngOnInit();
        expect(component.customStorageValue).toBe(component.memoryGB);
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.storageChanged.next).toHaveBeenCalledTimes(2);
      }));
  });

  describe('onStorageChanged()', () => {
    it(`should change the storageValue based on the input value
      from the slider or custom inputs`, fakeAsync(() => {
        spyOn(component.storageChanged, 'next');
        component.onStorageChanged(250);
        expect(component.storageSliderValue).toBe(250);
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.storageChanged.next).toHaveBeenCalledTimes(1);
      }));
  });

  describe('onChangeInputManageType()', () => {
    it(`should change the input manage type to Custom`, fakeAsync(() => {
      component.onChangeInputManageType(ServerInputManageType.Custom);
      component.fcServerStorageCustom = new FormControl();
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.inputManageType).toBe(ServerInputManageType.Custom);
    }));

    it(`should change the input manage type to Slider`, fakeAsync(() => {
      component.onChangeInputManageType(ServerInputManageType.Slider);
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.inputManageType).toBe(ServerInputManageType.Slider);
    }));
  });
});

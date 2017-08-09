import {
  async,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { ServerIpAddressComponent } from './server-ip-address.component';
import { ServerInputManageType } from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../../core';

describe('ServerIpAddressComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: ServerIpAddressComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerIpAddressComponent
      ],
      providers: [
        McsTextContentProvider
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerIpAddressComponent, {
      set: {
        template: `
        <div> ServerIpAddressComponent Template </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ServerIpAddressComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should notify the subscribers of the output parameter`, fakeAsync(() => {
      spyOn(component.ipAddressChanged, 'next');
      component.ngOnInit();
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.ipAddressChanged.next).toHaveBeenCalled();
    }));

    it(`should set the management type to button`, () => {
      expect(component.inputManageType).toBe(ServerInputManageType.Buttons);
    });
  });

  describe('onRadioButtonChanged()', () => {
    it(`should change the ipAddress value based on the inputted value
    and notify the output parameter`, fakeAsync(() => {
      let ipAddressValue = 'dhcp';

      spyOn(component.ipAddressChanged, 'next');
      component.onRadioButtonChanged(ipAddressValue);
      expect(component.ipAddressValue).toBe(ipAddressValue);
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.ipAddressChanged.next).toHaveBeenCalledTimes(1);
    }));
  });

  describe('onCustomIpAddressChanged()', () => {
    it(`should change custom ip address value based on the inputted value
    and notify the output parameter`, fakeAsync(() => {
      let customIpAddress = '192.168.1.1';

      spyOn(component.ipAddressChanged, 'next');
      component.onCustomIpAddressChanged(customIpAddress);
      expect(component.customIpAdrress).toBe(customIpAddress);
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.ipAddressChanged.next).toHaveBeenCalledTimes(1);
    }));
  });

  describe('onChangeInputManageType()', () => {
    it(`should change the input manage type to Custom`, fakeAsync(() => {
      component.onChangeInputManageType(ServerInputManageType.Custom);
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.inputManageType).toBe(ServerInputManageType.Custom);
    }));

    it(`should change the input manage type to Buttons`, fakeAsync(() => {
      component.onChangeInputManageType(ServerInputManageType.Buttons);
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.inputManageType).toBe(ServerInputManageType.Buttons);
    }));
  });
});

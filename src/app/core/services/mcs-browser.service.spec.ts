import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { McsDeviceType } from '@app/models';
import { CoreTestingModule } from '../testing';
import { McsBrowserService } from '../services/mcs-browser.service';
import { CoreDefinition } from '../core.definition';

describe('MscBrowserService', () => {

  /** Stub Services Mock */
  let mcsBrowserService: McsBrowserService;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        CoreTestingModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mcsBrowserService = getTestBed().get(McsBrowserService);
    });
  }));

  /** Test Implementation */
  describe('Initialize', () => {
    it('should register window.addEventListener event', () => {
      spyOn(window, 'addEventListener');
      mcsBrowserService.initialize();
      expect(window.addEventListener).toHaveBeenCalled();
    });

    it('should invoke the window.resize event', () => {
      spyOn(window, 'dispatchEvent');
      mcsBrowserService.initialize();
      expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('resize'));
    });
  });

  describe('OnResizeWindow', () => {
    it('should notify the subscriber of window size', () => {
      let event = {
        target: {
          innerWidth: CoreDefinition.DESKTOP_MIN_WIDTH,
          innerHeight: CoreDefinition.DESKTOP_MIN_WIDTH
        }
      };

      spyOn(mcsBrowserService.windowSizeStream, 'next');
      mcsBrowserService.onResizeWindow(event);
      expect(mcsBrowserService.windowSizeStream.next).toHaveBeenCalled();
    });

    it('should return McsDeviceType.Desktop as Device type', () => {
      let event = {
        target: {
          innerWidth: CoreDefinition.DESKTOP_MIN_WIDTH
        }
      };

      spyOn(mcsBrowserService.deviceTypeStream, 'next');
      mcsBrowserService.onResizeWindow(event);
      expect(mcsBrowserService.deviceTypeStream.next).toHaveBeenCalledWith(McsDeviceType.Desktop);
    });

    it('should return McsDeviceType.Tablet as Device type', () => {
      let event = {
        target: {
          innerWidth: CoreDefinition.TABLET_MIN_WIDTH
        }
      };
      spyOn(mcsBrowserService.deviceTypeStream, 'next');

      // Minimum
      mcsBrowserService.onResizeWindow(event);
      expect(mcsBrowserService.deviceTypeStream.next).toHaveBeenCalledWith(McsDeviceType.Tablet);

      // Average
      event.target.innerWidth = (CoreDefinition.TABLET_MIN_WIDTH +
        CoreDefinition.TABLET_MAX_WIDTH) / 2.0;
      mcsBrowserService.onResizeWindow(event);
      expect(mcsBrowserService.deviceTypeStream.next).toHaveBeenCalledWith(McsDeviceType.Tablet);

      // Maximum
      event.target.innerWidth = CoreDefinition.TABLET_MAX_WIDTH;
      mcsBrowserService.onResizeWindow(event);
      expect(mcsBrowserService.deviceTypeStream.next).toHaveBeenCalledWith(McsDeviceType.Tablet);
    });

    it('should return McsDeviceType.MobileLandscape as Device type', () => {
      let event = {
        target: {
          innerWidth: CoreDefinition.MOBILE_LANDSCAPE_MIN_WIDTH
        }
      };
      spyOn(mcsBrowserService.deviceTypeStream, 'next');

      // Minimum
      mcsBrowserService.onResizeWindow(event);
      expect(mcsBrowserService.deviceTypeStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobileLandscape);

      // Average
      event.target.innerWidth = (CoreDefinition.MOBILE_LANDSCAPE_MIN_WIDTH +
        CoreDefinition.MOBILE_LANDSCAPE_MAX_WIDTH) / 2.0;
      mcsBrowserService.onResizeWindow(event);
      expect(mcsBrowserService.deviceTypeStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobileLandscape);

      // Maximum
      event.target.innerWidth = CoreDefinition.MOBILE_LANDSCAPE_MAX_WIDTH;
      mcsBrowserService.onResizeWindow(event);
      expect(mcsBrowserService.deviceTypeStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobileLandscape);
    });

    it('should return McsDeviceType.MobilePortrait as Device type', () => {
      let event = {
        target: {
          innerWidth: CoreDefinition.MOBILE_PORTRAIT_MIN_WIDTH
        }
      };
      spyOn(mcsBrowserService.deviceTypeStream, 'next');

      // Minimum
      mcsBrowserService.onResizeWindow(event);
      expect(mcsBrowserService.deviceTypeStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobilePortrait);

      // Average
      event.target.innerWidth = (CoreDefinition.MOBILE_PORTRAIT_MIN_WIDTH +
        CoreDefinition.MOBILE_PORTRAIT_MAX_WIDTH) / 2.0;
      mcsBrowserService.onResizeWindow(event);
      expect(mcsBrowserService.deviceTypeStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobilePortrait);

      // Maximum
      event.target.innerWidth = CoreDefinition.MOBILE_PORTRAIT_MAX_WIDTH;
      mcsBrowserService.onResizeWindow(event);
      expect(mcsBrowserService.deviceTypeStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobilePortrait);
    });
  });
});

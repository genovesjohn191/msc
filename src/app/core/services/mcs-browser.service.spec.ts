import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { CoreDefinition } from '../core.definition';
import { McsDeviceType } from '../models/mcs-device-type';
import { McsBrowserService } from './mcs-browser.service';

describe('MscBrowserService', () => {

  /** Stub Services Mock */
  let mcsBrowserService: McsBrowserService;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
      ],
      providers: [
        McsBrowserService
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
      mcsBrowserService.Initialize();
      expect(window.addEventListener).toHaveBeenCalled();
    });

    it('should invoke the window.resize event', () => {
      spyOn(window, 'dispatchEvent');
      mcsBrowserService.Initialize();
      expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('resize'));
    });
  });

  describe('OnResizeWindow', () => {
    it('should return McsDeviceType.Desktop as Device type', () => {
      let event = {
        target: {
          innerWidth: CoreDefinition.DESKTOP_MIN_WIDTH
        }
      };

      spyOn(mcsBrowserService.resizeWindowStream, 'next');
      mcsBrowserService.OnResizeWindow(event);
      expect(mcsBrowserService.resizeWindowStream.next).toHaveBeenCalledWith(McsDeviceType.Desktop);
    });

    it('should return McsDeviceType.Tablet as Device type', () => {
      let event = {
        target: {
          innerWidth: CoreDefinition.TABLET_MIN_WIDTH
        }
      };
      spyOn(mcsBrowserService.resizeWindowStream, 'next');

      // Minimum
      mcsBrowserService.OnResizeWindow(event);
      expect(mcsBrowserService.resizeWindowStream.next).toHaveBeenCalledWith(McsDeviceType.Tablet);

      // Average
      event.target.innerWidth = (CoreDefinition.TABLET_MIN_WIDTH +
        CoreDefinition.TABLET_MAX_WIDTH) / 2.0;
      mcsBrowserService.OnResizeWindow(event);
      expect(mcsBrowserService.resizeWindowStream.next).toHaveBeenCalledWith(McsDeviceType.Tablet);

      // Maximum
      event.target.innerWidth = CoreDefinition.TABLET_MAX_WIDTH;
      mcsBrowserService.OnResizeWindow(event);
      expect(mcsBrowserService.resizeWindowStream.next).toHaveBeenCalledWith(McsDeviceType.Tablet);
    });

    it('should return McsDeviceType.MobileLandscape as Device type', () => {
      let event = {
        target: {
          innerWidth: CoreDefinition.MOBILE_LANDSCAPE_MIN_WIDTH
        }
      };
      spyOn(mcsBrowserService.resizeWindowStream, 'next');

      // Minimum
      mcsBrowserService.OnResizeWindow(event);
      expect(mcsBrowserService.resizeWindowStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobileLandscape);

      // Average
      event.target.innerWidth = (CoreDefinition.MOBILE_LANDSCAPE_MIN_WIDTH +
        CoreDefinition.MOBILE_LANDSCAPE_MAX_WIDTH) / 2.0;
      mcsBrowserService.OnResizeWindow(event);
      expect(mcsBrowserService.resizeWindowStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobileLandscape);

      // Maximum
      event.target.innerWidth = CoreDefinition.MOBILE_LANDSCAPE_MAX_WIDTH;
      mcsBrowserService.OnResizeWindow(event);
      expect(mcsBrowserService.resizeWindowStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobileLandscape);
    });

    it('should return McsDeviceType.MobilePortrait as Device type', () => {
      let event = {
        target: {
          innerWidth: CoreDefinition.MOBILE_PORTRAIT_MIN_WIDTH
        }
      };
      spyOn(mcsBrowserService.resizeWindowStream, 'next');

      // Minimum
      mcsBrowserService.OnResizeWindow(event);
      expect(mcsBrowserService.resizeWindowStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobilePortrait);

      // Average
      event.target.innerWidth = (CoreDefinition.MOBILE_PORTRAIT_MIN_WIDTH +
        CoreDefinition.MOBILE_PORTRAIT_MAX_WIDTH) / 2.0;
      mcsBrowserService.OnResizeWindow(event);
      expect(mcsBrowserService.resizeWindowStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobilePortrait);

      // Maximum
      event.target.innerWidth = CoreDefinition.MOBILE_PORTRAIT_MAX_WIDTH;
      mcsBrowserService.OnResizeWindow(event);
      expect(mcsBrowserService.resizeWindowStream.next)
        .toHaveBeenCalledWith(McsDeviceType.MobilePortrait);
    });
  });
});

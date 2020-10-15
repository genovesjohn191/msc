import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { McsBrowserService } from '../services/mcs-browser.service';
import { CoreTestingModule } from '../testing';

describe('MscBrowserService', () => {

  /** Stub Services Mock */
  let mcsBrowserService: McsBrowserService;

  beforeEach(waitForAsync(() => {
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
      mcsBrowserService = TestBed.inject(McsBrowserService);
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
});

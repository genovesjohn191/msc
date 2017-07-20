import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { McsStorageService } from './mcs-storage.service';
import { AppState } from '../../app.service';
import { CoreTestingModule } from '../testing';

describe('McsStorageService', () => {

  /** Declare Service */
  let mcsStorageService: McsStorageService;
  let appState: AppState;
  let key: string = 'key_test';
  let userId: string = 'F500120501';

  /** Initialize Service */
  beforeEach(async(() => {
    appState = new AppState();
    appState.set('userId', userId);
  }));

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Override Provider */
    TestBed.overrideProvider(McsStorageService, { useValue: new McsStorageService(appState) });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mcsStorageService = getTestBed().get(McsStorageService);
    });
  }));

  /** Test Implementation */
  describe('createLocalStorageKey()', () => {
    it('should contain UserId value and the inputted Key', () => {
      let localStorageKey = mcsStorageService.createLocalStorageKey(key);
      expect(localStorageKey).toContain(userId);
      expect(localStorageKey).toContain(key);
    });
  });

  describe('setItem()', () => {
    it('should call the setItem() of localStorage 1 time', () => {
      spyOn(localStorage, 'setItem');
      mcsStorageService.setItem<boolean>(key, true);
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      expect(localStorage.setItem).toHaveBeenCalledWith
        (mcsStorageService.createLocalStorageKey(key), JSON.stringify(true));
    });
  });

  describe('getItem()', () => {
    it('should call the getItem() of localStorage 1 time', () => {
      spyOn(localStorage, 'getItem');
      mcsStorageService.getItem<boolean>(key);
      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeItem()', () => {
    it('should call the removeItem() of localStorage 1 time', () => {
      spyOn(localStorage, 'removeItem');
      mcsStorageService.removeItem(key);
      expect(localStorage.removeItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearRecord()', () => {
    it('should call the clearRecord() of localStorage 1 time', () => {
      spyOn(localStorage, 'clear');
      mcsStorageService.clearRecord();
      expect(localStorage.clear).toHaveBeenCalledTimes(1);
    });
  });
});

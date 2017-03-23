import {
  async,
  TestBed
} from '@angular/core/testing';
import { MscStorageService } from './mcs-storage.service';
import { AppState } from '../../app.service';

describe('MscStorageService', () => {

  /** Declare Service */
  let mscStorageService: MscStorageService;
  let appState: AppState;
  let key: string = 'key_test';
  let userId: string = 'F500120501';

  /** Initialize Service */
  beforeEach(async(() => {
    appState = new AppState();
    appState.set('userId', userId);
    mscStorageService = new MscStorageService(appState);
  }));

  /** Test Implementation */
  describe('createLocalStorageKey()', () => {
    it('should contain UserId value and the inputted Key', () => {
      let localStorageKey = mscStorageService.createLocalStorageKey(key);
      expect(localStorageKey).toContain(userId);
      expect(localStorageKey).toContain(key);
    });
  });

  describe('setItem()', () => {
    it('should call the setItem() of localStorage 1 time', () => {
      spyOn(localStorage, 'setItem');
      mscStorageService.setItem<boolean>(key, true);
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      expect(localStorage.setItem).toHaveBeenCalledWith
        (mscStorageService.createLocalStorageKey(key), JSON.stringify(true));
    });
  });

  describe('getItem()', () => {
    it('should call the getItem() of localStorage 1 time', () => {
      spyOn(localStorage, 'getItem');
      mscStorageService.getItem<boolean>(key);
      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeItem()', () => {
    it('should call the removeItem() of localStorage 1 time', () => {
      spyOn(localStorage, 'removeItem');
      mscStorageService.removeItem(key);
      expect(localStorage.removeItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearRecord()', () => {
    it('should call the clearRecord() of localStorage 1 time', () => {
      spyOn(localStorage, 'clear');
      mscStorageService.clearRecord();
      expect(localStorage.clear).toHaveBeenCalledTimes(1);
    });
  });
});

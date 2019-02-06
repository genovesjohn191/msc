import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { AppState } from './app.service';

describe('AppState', () => {
  /** Stub Services Mock */
  let appState: AppState;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      providers: [
        AppState
      ]
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      appState = getTestBed().get(AppState);
    });
  }));

  /** Test Implementation */
  describe('set()', () => {
    it('should set the property value', () => {
      let stateName = 'APPSTATE_SET_TEST';
      appState.set(stateName, 1);
      expect(appState.get(stateName)).toEqual(1);
    });
  });

  describe('get()', () => {
    it('should get the property value', () => {
      let stateName = 'APPSTATE_GET_TEST';
      appState.set(stateName, 4);
      expect(appState.get(stateName)).toEqual(4);
    });
  });

  describe('remove()', () => {
    it('should remove the property on the state', () => {
      let stateName = 'APPSTATE_REMOVE_TEST';
      appState.set(stateName, 4);
      appState.remove(stateName);
      expect(appState.has(stateName)).toBeFalsy();
    });
  });

  describe('has()', () => {
    it('should return true when the property exist on the state', () => {
      let stateName = 'APPSTATE_HAS_TEST';
      appState.set(stateName, 4);
      expect(appState.has(stateName)).toBeTruthy();
    });
  });
});

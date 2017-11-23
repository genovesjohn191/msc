import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { CoreDefinition } from '../core.definition';
import { McsAuthenticationService } from './mcs-authentication.service';
import { McsApiIdentity } from '../models/response/mcs-api-identity';
import { CoreTestingModule } from '../testing';
import { AppState } from '../../app.service';

describe('McsAuthenticationService', () => {

  /** Stub Services Mock */
  let appState: AppState;
  let mcsAuthenticationService: McsAuthenticationService;

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
      appState = getTestBed().get(AppState);
      mcsAuthenticationService = getTestBed().get(McsAuthenticationService);
    });
  }));

  /** Test Implementation */
  describe('hasPermission', () => {
    beforeEach(async(() => {
      let userIdentity = new McsApiIdentity();
      userIdentity.permissions = ['VmView', 'VmEdit', 'OrderEdit'];
      appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, userIdentity);
    }));

    it('should return true if required permission is in list', () => {
      let hasPermission: boolean = mcsAuthenticationService.hasPermission(['VmView']);
      expect(hasPermission).toBeTruthy();
    });

    it('should return true if all required permission are in list', () => {
      let hasPermission: boolean = mcsAuthenticationService.hasPermission(['VmView', 'VmEdit']);
      expect(hasPermission).toBeTruthy();
    });

    it('should return false if at least one required permission is not in list', () => {
      let hasPermission: boolean = mcsAuthenticationService.hasPermission(['VmView', 'test']);
      expect(hasPermission).toBeFalsy();
    });

    it('should return false if required permission is not in list', () => {
      let hasPermission: boolean = mcsAuthenticationService.hasPermission(['test']);
      expect(hasPermission).toBeFalsy();
    });
  });
});

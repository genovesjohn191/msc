import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import {
  Router,
  NavigationEnd
} from '@angular/router';
import { CoreDefinition } from '../core.definition';
import { AppState } from '../../app.service';
import { McsApiIdentity } from '../models/response/mcs-api-identity';
import { RouterTestingModule } from '@angular/router/testing';
import { McsRoutePermissionGuard } from './mcs-route-permission.guard';
import { CoreTestingModule } from '../testing';

describe('McsRoutePermissionGuard', () => {

  /** Stub Services Mock */
  let mcsRoutePermissionGuard: McsRoutePermissionGuard;
  let router: Router;
  let appState: AppState;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      providers: [ RouterTestingModule ],
      imports: [
        CoreTestingModule,
        RouterTestingModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      router = getTestBed().get(Router);
      appState = getTestBed().get(AppState);
      mcsRoutePermissionGuard = getTestBed().get(McsRoutePermissionGuard);
    });
  }));

  /** Test Implementation */
  describe('onNavigateEnd', () => {
    beforeEach(async(() => {
      mcsRoutePermissionGuard.initializeRouteChecking();
    }));

    // Server Pages
    it('should deny access to /servers route when user has no VmAccess permission', () => {
      let userIdentity = new McsApiIdentity();
      userIdentity.permissions = ['VmEdit'];
      appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, userIdentity);

      spyOn(router, 'navigate');
      mcsRoutePermissionGuard.onNavigateEnd(
        new NavigationEnd(1, '/servers', '/servers'));
      expect(router.navigate).toHaveBeenCalledTimes(1);
    });

    it('should grant access to /servers route when user has VmAccess permission', () => {
      let userIdentity = new McsApiIdentity();
      userIdentity.permissions = ['VmAccess'];
      appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, userIdentity);

      spyOn(router, 'navigate');
      mcsRoutePermissionGuard.onNavigateEnd(
        new NavigationEnd(1, '/servers', '/servers'));
      expect(router.navigate).toHaveBeenCalledTimes(0);
    });
  });
});

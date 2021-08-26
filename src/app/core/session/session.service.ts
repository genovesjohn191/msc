import {
  Injectable,
  isDevMode
} from '@angular/core';
import { McsFeatureFlag } from '@app/models';
import {
  coerceNumber,
  CommonDefinition
} from '@app/utilities';
import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';
import { McsCookieService } from '../services/mcs-cookie.service';

@Injectable()
export class McsSessionService {
  constructor(
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _accesscontrolService: McsAccessControlService,
    private _cookieService: McsCookieService
  ) { }

  public _sessionIsIdleFlag: boolean = false;

  public get sessionTimedOut(): boolean {
    let maxIAllowedIdleTimeInSeconds = CommonDefinition.SESSION_IDLE_TIME_IN_SECONDS
      + CommonDefinition.SESSION_TIMEOUT_COUNTDOWN_IN_SECONDS;
    let sessionIdCookie =
      this._cookieService.getEncryptedItem(CommonDefinition.COOKIE_SESSION_ID, false);

    let expectedSessionId = this._authenticationIdentity.user.hashedId + this._authenticationIdentity.user.expiry;
    let hasTimeoutBypass = this._accesscontrolService.hasAccessToFeature(McsFeatureFlag.BypassSessionInactivityTimeout) || isDevMode();
    let hasTimedOut = this.idleTimeInSeconds >= maxIAllowedIdleTimeInSeconds || sessionIdCookie === expectedSessionId;

    return !hasTimeoutBypass && hasTimedOut;
  }

  public get sessionIsIdle(): boolean {
    let hasTimeoutBypass = this._accesscontrolService.hasAccessToFeature(McsFeatureFlag.BypassSessionInactivityTimeout) || isDevMode();
    let isNowIdle = this.idleTimeInSeconds >= CommonDefinition.SESSION_IDLE_TIME_IN_SECONDS
    || this._sessionIsIdleFlag;

    return !hasTimeoutBypass && isNowIdle;
  }

  public get idleTimeInSeconds(): number {
    let cookieSessionIdleTime =
      coerceNumber(this._cookieService.getItem(CommonDefinition.COOKIE_SESSION_TIMER));
    return cookieSessionIdleTime;
  }
}
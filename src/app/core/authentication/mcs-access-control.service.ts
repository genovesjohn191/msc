import { Injectable } from '@angular/core';
import { isNullOrEmpty } from '../../utilities';
import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';

@Injectable()
export class McsAccessControlService {

  constructor(private _authenticationIdentity: McsAuthenticationIdentity) {
  }

  /**
   * Checks both permission and feature
   */
  public hasAccess(requiredPermissions: string[], feature: string): boolean {
    let user = this._authenticationIdentity.user;
    if (isNullOrEmpty(user)) {
      return false;
    }

    let hasPermission = this.hasPermission(requiredPermissions);
    let featureEnabled = this.hasAccessToFeature(feature);
    return hasPermission && featureEnabled;
  }

  public hasPermission(requiredPermissions: string[]) {
    let user = this._authenticationIdentity.user;

    if (isNullOrEmpty(requiredPermissions)) {
      return true;
    }

    if (isNullOrEmpty(user) || isNullOrEmpty(user.permissions)) {
      return false;
    }

    let hasPermission: boolean = !isNullOrEmpty(requiredPermissions);

    if (!hasPermission) {
      return hasPermission;
    }

    hasPermission = true;

    // Loop thru each required permissions
    // making sure all of them are existing in the users permissions.
    for (let value of requiredPermissions) {
      if (user.permissions.indexOf(value) === -1) {
        hasPermission = false;
        break;
      }
    }

    return hasPermission;
  }

  public hasAccessToFeature(feature: string, defaultValue: boolean = false) {
    let user = this._authenticationIdentity.user;

    if (isNullOrEmpty(feature)) {
      return true;
    }

    if (isNullOrEmpty(user) || isNullOrEmpty(user.features)) {
      return false;
    }

    let targetFeature = user.features.find((featureFlag) => featureFlag.key === feature);

    if (isNullOrEmpty(targetFeature)) {
      return defaultValue;
    }

    return targetFeature.value;
  }
}

import { Injectable } from '@angular/core';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  McsIdentity,
  McsKeyValuePair
} from '@app/models';
import { McsAuthenticationIdentity } from './mcs-authentication.identity';

@Injectable()
export class McsAccessControlService {

  constructor(private _authenticationIdentity: McsAuthenticationIdentity) { }

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

  /**
   * Returns true when the logged in user has the permission given
   * @param requiredPermissions Required permission to be checked
   */
  public hasPermission(requiredPermissions: string[]): boolean {
    if (isNullOrEmpty(requiredPermissions)) { return true; }
    let user = this._authenticationIdentity.user;

    // Check user existing permissions
    let userPermissions = getSafeProperty<McsIdentity, string[]>(
      user, (obj) => obj.permissions
    );
    if (isNullOrEmpty(userPermissions)) { return false; }

    // Loop thru each required permissions
    // making sure all of them are exist in the users permissions.
    let hasPermission: boolean = true;
    for (let value of requiredPermissions) {
      if (userPermissions.indexOf(value) === -1) {
        hasPermission = false;
        break;
      }
    }
    return hasPermission;
  }

  /**
   * Returns true when the given feature flag is turned on
   * @param feature Feature flag to be checked
   * @param defaultValue Default value of the feature flag
   */
  public hasAccessToFeature(feature: string, defaultValue: boolean = false): boolean {
    if (isNullOrEmpty(feature)) { return true; }
    let user = this._authenticationIdentity.user;

    // Check existing features
    let features = getSafeProperty<McsIdentity, McsKeyValuePair[]>(
      user, (obj) => obj.features
    );
    if (isNullOrEmpty(features)) { return false; }

    // Check feature flag
    let targetFeature = features.find((featureFlag) => {
      return featureFlag.key.toLowerCase() === feature.toLowerCase();
    });
    if (isNullOrEmpty(targetFeature)) { return defaultValue; }
    return targetFeature.value;
  }
}

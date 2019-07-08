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
  public hasAccess(requiredPermissions: string[], feature: string | string[]): boolean {
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
    let hasPermission: boolean = false;
    for (let value of requiredPermissions) {
      if (userPermissions.indexOf(value) !== -1) {
        hasPermission = true;
        break;
      }
    }
    return hasPermission;
  }

  /**
   * Returns true when the given feature flag is turned on
   * @param flags Feature flags to be checked
   */
  public hasAccessToFeature(flags: string | string[]): boolean {
    if (isNullOrEmpty(flags)) { return true; }

    let userFeatures = this._getUserFeatureFlags();
    if (isNullOrEmpty(userFeatures)) { return false; }

    // Check feature flag
    let targetFeature;
    let featureFlags: string[] = Array.isArray(flags) ? flags : [flags];

    targetFeature = userFeatures.find((userFeature) => {
      let foundFeatureFlag = featureFlags.find(
        (featuresFlag) => featuresFlag.toLowerCase() === userFeature.key.toLowerCase() && userFeature.value
      );
      return !isNullOrEmpty(foundFeatureFlag);
    });

    return isNullOrEmpty(targetFeature) ? false : targetFeature.value;
  }

  /**
   * Returns the current feature flags the user have
   */
  private _getUserFeatureFlags(): McsKeyValuePair[] {
    let user = this._authenticationIdentity.user;
    // Check existing features
    return getSafeProperty<McsIdentity, McsKeyValuePair[]>(
      user, (obj) => obj.features
    );
  }
}

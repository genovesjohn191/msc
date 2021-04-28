import { Injectable } from '@angular/core';
import {
  McsIdentity,
  McsKeyValuePair
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

import { McsAuthenticationIdentity } from './mcs-authentication.identity';

@Injectable()
export class McsAccessControlService {

  public hasAccessToCatalog = false;

  constructor(private _authenticationIdentity: McsAuthenticationIdentity) { }

  public setCatalogAccess(hasAccess: boolean): void {
    this.hasAccessToCatalog = hasAccess;
  }

  /**
   * Checks both permission and feature
   */
  public hasAccess(
    permissions: string[],
    feature: string | string[],
    requireAllPermissions: boolean = false,
    requireAllFeatures: boolean = false): boolean {

    let user = this._authenticationIdentity.user;
    if (isNullOrEmpty(user)) {
      return false;
    }

    let hasPermission = this.hasPermission(permissions, requireAllPermissions);
    let featureEnabled = this.hasAccessToFeature(feature, requireAllFeatures);
    return hasPermission && featureEnabled;
  }

  /**
   * Returns true when the logged in user has the permission given
   * @param permissions Required permission to be checked
   */
  public hasPermission(permissions: string[], requireAll: boolean = false): boolean {
    if (isNullOrEmpty(permissions)) { return true; }
    let user = this._authenticationIdentity.user;

    // Check user existing permissions
    let userPermissions = getSafeProperty<McsIdentity, string[]>(
      user, (obj) => obj.permissions
    );
    if (isNullOrEmpty(userPermissions)) { return false; }

    return requireAll
      ? this._hasAllPermissions(userPermissions, permissions)
      : this._hasAnyPermission(userPermissions, permissions);
  }

  /**
   * Returns true when the given feature flag is turned on
   * @param flags Feature flags to be checked
   */
  public hasAccessToFeature(flags: string | string[], requireAll: boolean = false): boolean {
    if (isNullOrEmpty(flags)) { return true; }

    let userFeatures = this._getUserFeatureFlags();
    if (isNullOrEmpty(userFeatures)) { return false; }

    let featureFlags: string[] = Array.isArray(flags) ? flags : [flags];

    return requireAll
      ? this._hasAllFeatureFlags(userFeatures, featureFlags)
      : this._hasAnyFeatureFlag(userFeatures, featureFlags);
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

  private _hasAllPermissions(userPermissions: string[], permissions: string[]): boolean {
    let hasPermission: boolean = true;

    for (let value of permissions) {
      hasPermission = userPermissions.indexOf(value) !== -1;
      if (!hasPermission) { break; }
    }

    return hasPermission;
  }

  private _hasAnyPermission(userPermissions: string[], permissions: string[]): boolean {
    let hasPermission: boolean = false;

    for (let value of permissions) {
      hasPermission = userPermissions.indexOf(value) !== -1;
      if (hasPermission) { break; }
    }

    return hasPermission;
  }

  private _hasAllFeatureFlags(userFeatures: McsKeyValuePair[], featureFlags: string[]): boolean {
    let isFeatureFlagSwitchedOn: boolean = true;

    for (let featureFlag of featureFlags) {
      let foundFeatureFlag = this._getFeatureFlag(userFeatures, featureFlag);
      isFeatureFlagSwitchedOn = !isNullOrEmpty(foundFeatureFlag) && foundFeatureFlag.value;
      if (!isFeatureFlagSwitchedOn) { break; }
    }

    return isFeatureFlagSwitchedOn;
  }

  private _hasAnyFeatureFlag(userFeatures: McsKeyValuePair[], featureFlags: string[]): boolean {
    let isFeatureFlagSwitchedOn: boolean = false;

    for (let featureFlag of featureFlags) {
      let foundFeatureFlag = this._getFeatureFlag(userFeatures, featureFlag);
      isFeatureFlagSwitchedOn = !isNullOrEmpty(foundFeatureFlag) && foundFeatureFlag.value;
      if (isFeatureFlagSwitchedOn) { break; }
    }

    return isFeatureFlagSwitchedOn;
  }

  private _getFeatureFlag(userFeatures: McsKeyValuePair[], featureFlagName: string): McsKeyValuePair {
    return userFeatures.find((userFeature) => featureFlagName.toLowerCase() === userFeature.key.toLowerCase());
  }
}

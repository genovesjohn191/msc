import { Injectable } from '@angular/core';
import {
  Router,
  NavigationEnd,
} from '@angular/router';
import { CoreDefinition } from '../core.definition';
import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';
import { isNullOrEmpty } from '../../utilities';

declare let dataLayer: any;

@Injectable()
export class GoogleAnalyticsEventsService {

  constructor(
    private _mcsAuthenticationIdentity: McsAuthenticationIdentity,
    private _router: Router) {
    this._initializeAnalytics();
  }

  public emitEvent(
    _eventCategory: string,
    _eventAction: string,
    _eventLabel: string = null,
    _eventValue: number = null) {
    dataLayer.push({
      'event': 'customEvent',
      'eventCategory': _eventCategory.toLowerCase(),
      'eventAction': _eventAction.toLowerCase(),
      'eventLabel': _eventLabel.toLowerCase(),
      'eventValue': _eventValue
    });
  }

  private _initializeAnalytics(): void {
    this._mcsAuthenticationIdentity.userChanged
      .subscribe((updated) => {
        if (updated) {
          this._setUser();
          this._subscribeToNavigationEvents();
        }
      });
  }

  private _setUser() {
    let identity = this._mcsAuthenticationIdentity.user.hashedId.split('.');
    dataLayer.push({
      'userID': identity[0],
      'companyGroup': identity[1],
    });
    dataLayer.push({
      'event': 'userIdentityUpdate'
    });
  }

  private _subscribeToNavigationEvents(): void {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Mask UUID from the URL
        let maskedUrl = this._maskPrivateDataFromUrl(
          event.urlAfterRedirects, CoreDefinition.REGEX_UUID_PATTERN, '{id}');
        // Mask JWT Token from the URL
        maskedUrl = this._maskPrivateDataFromUrl(
          maskedUrl, CoreDefinition.REGEX_BEARER_PATTERN, 'bearer={token}');

        dataLayer.push({
          'event': 'virtualPageView',
          'virtualPageURL': maskedUrl
        });
      }
    });
  }

  private _maskPrivateDataFromUrl(
    url: string,
    pattern: RegExp,
    value: string): string {
    if (isNullOrEmpty(url)) { return ''; }

    return url.replace(pattern, value);
  }
}

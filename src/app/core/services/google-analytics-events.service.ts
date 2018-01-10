import { Injectable } from '@angular/core';
import {
  Router,
  NavigationEnd,
} from '@angular/router';
import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';

declare let dataLayer: any;

@Injectable()
export class GoogleAnalyticsEventsService {

  constructor(
    private _mcsAuthenticationIdentity: McsAuthenticationIdentity,
    private _router: Router) {
    this._initializeAnalytics();
  }

  public emitEvent(_eventCategory: string,
                   _eventAction: string,
                   _eventLabel: string = null,
                   _eventValue: number = null) {
    dataLayer.push({
      'event': 'customEvent',
      'eventCategory': _eventCategory,
      'eventAction': _eventAction,
      'eventLabel': _eventLabel,
      'eventValue': _eventValue
      });
  }

  private _initializeAnalytics(): void {
    this._mcsAuthenticationIdentity.changeIdentityStream.subscribe(( updated ) => {
      if (updated) {
        this._setUser();
        this._subscribeToNavigationEvents();
      }});
  }

  private _setUser() {
    dataLayer.push({
      'userID' : this._mcsAuthenticationIdentity.hashedId
    });
  }

  private _subscribeToNavigationEvents(): void {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        dataLayer.push({
          'event':'virtualPageView',
          'virtualPageURL': event.urlAfterRedirects
        });
      }
    });
  }
}

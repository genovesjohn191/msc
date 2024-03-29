import { Injectable } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsIdentity,
  McsRouteInfo
} from '@app/models';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import {
  LogClass,
  LogIgnore
} from '@peerlancers/ngx-logger';

declare const dataLayer: any;

@Injectable()
@LogClass()
export class GoogleAnalyticsEventsService {

  constructor(private _eventDispatcher: EventBusDispatcherService) {
    this._registerEvents();
  }

  /**
   * Event that emits when an action has been triggered
   * @param _eventCategory Event category of the GTM
   * @param _eventAction Event action name of the control
   * @param _eventLabel Event label of the control
   * @param _eventValue Event value to be printed on GTM
   */
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

  /**
   * Event that gets emitted when the user has been changed
   */
  private _onUserChanged(user: McsIdentity): void {
    if (isNullOrEmpty(user)) { return; }
    this._setUser(user);
  }

  /**
   * Event that gets emitted when the route has been changed
   * @param activeRoute Custom activated route of the router
   */
  private _onRouteChanged(activeRoute: McsRouteInfo): void {
    if (isNullOrEmpty(activeRoute)) { return; }

    // Mask UUID from the URL
    let maskedUrl = this._maskPrivateDataFromUrl(
      activeRoute.urlAfterRedirects, CommonDefinition.REGEX_UUID_PATTERN, '{id}');

    // Mask JWT Token from the URL
    maskedUrl = this._maskPrivateDataFromUrl(
      maskedUrl, CommonDefinition.REGEX_BEARER_PATTERN, 'bearer={token}');

    dataLayer.push({
      'event': 'virtualPageView',
      'virtualPageURL': maskedUrl
    });
  }

  /**
   * Sets the user to GTM Identity configuration
   * @param user User to be set on the GTM
   */
  private _setUser(user: McsIdentity) {
    let identity = user.hashedId?.split('.');
    if (isNullOrEmpty(identity)) { return; }

    dataLayer.push({
      'userID': identity[0],
      'companyGroup': identity[1],
      'event': 'userIdentityUpdate'
    });
  }

  /**
   * Masks the private data from url into GTM
   * @param url Url to be masked
   * @param pattern Regex Pattern to be execute in masking
   * @param value Value to be checked
   */
  @LogIgnore()
  private _maskPrivateDataFromUrl(
    url: string,
    pattern: RegExp,
    value: string): string {
    if (isNullOrEmpty(url)) { return ''; }

    return url.replace(pattern, value);
  }

  /**
   * Register event listeners to event-bus
   */
  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      McsEvent.userChange, this._onUserChanged.bind(this));

    this._eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChanged.bind(this));
  }
}

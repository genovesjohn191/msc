import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { isNullOrEmpty } from '../../utilities';

@Injectable()
export class LoaderService {
  /**
   * Animation strategy for the loader and backdrop component
   */
  private _fadeOut: string;
  public get fadeOut(): string {
    return this._fadeOut;
  }
  public set fadeOut(value: string) {
    if (this._fadeOut !== value) {
      this._fadeOut = value;
    }
  }

  /**
   * List of subscription to monitor by the loader
   */
  private _subscriptions: Subscription[];

  constructor() {
    this._subscriptions = new Array();
  }

  /**
   * Set the subscriber to track the status
   *
   * `@Note` The "add" method of observable will invoke when the
   * subscription is ended, so make sure you unsubscribe or else the loader will remain
   * @param subscription Observable subscription to track
   */
  public setSubscribers(subscriptions: Subscription | Subscription[]) {
    if (isNullOrEmpty(subscriptions)) { return; }

    // Filter subscribtions
    if (Array.isArray(subscriptions)) {
      this._subscriptions = subscriptions.filter((subscription) => {
        return !isNullOrEmpty(subscription);
      });
    } else {
      this._subscriptions.push(subscriptions);
    }

    // Add subscribers to all subscriptions
    this._subscriptions.forEach((item) => {
      item.add(() => this._onCompletion(item));
    });
  }

  /**
   * Determine whether the loader/subscriptions are still ongoing
   */
  public isActive(): boolean {
    if (isNullOrEmpty(this._subscriptions)) {
      this.fadeOut = 'fadeOut';
      return false;
    }
    this.fadeOut = undefined;
    return true;
  }

  /**
   * This method will get notified when the subscription is finished
   * @param subscription Subscription to monitor the process
   */
  private _onCompletion(subscription: Subscription) {
    let subsIndex = this._subscriptions.indexOf(subscription);
    if (subsIndex === -1) { return; }

    this._subscriptions.splice(subsIndex, 1);
  }
}

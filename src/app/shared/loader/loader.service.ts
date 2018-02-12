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
   *
   * `@Note:` We need to use Set in order for the instance
   * of the previous subscription not to be added again
   */
  private _subscriptions: Set<Subscription>;

  constructor() {
    this._subscriptions = new Set();
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
    this._subscriptions.clear();

    // Filter subscriptions
    if (Array.isArray(subscriptions)) {
      let filtered = subscriptions.filter((subscription) => {
        return !isNullOrEmpty(subscription);
      });
      if (!isNullOrEmpty(filtered)) {
        filtered.forEach((sub) => {
          this._subscriptions.add(sub);
        });
      }
    } else {
      this._subscriptions.add(subscriptions);
    }

    // Add subscribers to all subscriptions
    this._subscriptions.forEach((item) => {
      if (item instanceof Subscription) {
        item.add(() => this._onCompletion(item));
      }
    });
  }

  /**
   * Determine whether the loader/subscriptions are still ongoing
   */
  public isActive(): boolean {
    if (isNullOrEmpty(this._subscriptions) || this._subscriptions.size === 0) {
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
  private _onCompletion(_subscription: Subscription) {
    this._subscriptions.delete(_subscription);
  }
}

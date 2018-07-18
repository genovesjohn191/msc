import { Injectable } from '@angular/core';
import {
  Subscription,
  Subject
} from 'rxjs';
import { isNullOrEmpty, getSafeProperty } from '../../utilities';

@Injectable()
export class LoaderService {
  /**
   * Event that emits when the subscriptions data has changed
   */
  public subscriptionsChange = new Subject<Set<Subscription>>();

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
    this.subscriptionsChange.next(this._subscriptions);
    this._subscriptions.forEach((item) => {
      if (item instanceof Subscription) {
        item.add(() => this._onCompletion(item));
      }
    });
  }

  /**
   * Returns true when all the subscriptions are removed
   */
  public isActive(): boolean {
    let subscriptionsCount = getSafeProperty(this._subscriptions, (obj) => obj.size);
    if (isNullOrEmpty(subscriptionsCount)) { return false; }

    let hasActive: boolean = false;
    this._subscriptions.forEach((subscription) => {
      if (hasActive) { return; }
      hasActive = getSafeProperty(subscription, (obj) => !obj.closed);
    });
    return hasActive;
  }

  /**
   * This method will get notified when the subscription is finished
   * @param subscription Subscription to monitor the process
   */
  private _onCompletion(_subscription: Subscription) {
    this._subscriptions.delete(_subscription);
    this.subscriptionsChange.next(this._subscriptions);
  }
}

import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import {
  isNullOrEmpty,
  deleteArrayRecord,
  clearArrayRecord
} from '../../utilities';

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
    clearArrayRecord(this._subscriptions);

    // Filter subscribtions
    if (Array.isArray(subscriptions)) {
      let filtered = subscriptions.filter((subscription) => {
        return !isNullOrEmpty(subscription);
      });
      if (!isNullOrEmpty(filtered)) {
        filtered.forEach((sub) => {
          this._subscriptions.push(sub);
        });
      }
    } else {
      this._subscriptions.push(subscriptions);
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
    if (isNullOrEmpty(this._subscriptions) || this._subscriptions.length === 0) {
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
    deleteArrayRecord(this._subscriptions, (_sub) => {
      return _sub.closed === true;
    });
  }
}

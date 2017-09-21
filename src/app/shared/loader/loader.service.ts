import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { isNullOrEmpty } from '../../utilities';

@Injectable()
export class LoaderService {

  /**
   * Flag to determine whether the subscription is active
   */
  private _active: boolean;
  public get active(): boolean {
    return this._active;
  }
  public set active(value: boolean) {
    if (this._active !== value) {
      this._active = value;
    }
  }

  /**
   * Animation strategy for the loader and backdrop component
   */
  private _animate: string;
  public get animate(): string {
    return this._animate;
  }
  public set animate(value: string) {
    if (this._animate !== value) {
      this._animate = value;
    }
  }

  constructor() {
    this._active = false;
  }

  /**
   * Set the subscriber to track the status
   *
   * `@Note` The "add" method of observable will invoke when the
   * subscription is ended, so make sure you unsubscribe or else the loader will remain
   * @param subscription Observable subscription to track
   */
  public setSubscriber(subscription: Subscription) {
    if (isNullOrEmpty(subscription)) { return; }

    this.active = true;
    subscription.add(() => {
      this.animate = 'fadeOut';
      this.active = false;
    });
  }
}

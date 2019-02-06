import { Injectable } from '@angular/core';
import { isNullOrUndefined } from './utilities';

export type InternalStateType = {
  [key: string]: any
};

@Injectable()
export class AppState {
  private _state: InternalStateType = { };

  /**
   * Returns the whole state structure
   */
  public get state() {
    return this._state = this._clone(this._state);
  }

  /**
   * Returns the value of the property provided
   * @param prop Property on where to get the value
   */
  public get(prop?: any) {
    const state = this.state;
    return state.hasOwnProperty(prop) ? state[prop] : undefined;
  }

  /**
   * Sets the property string with associated value
   * @param prop Property to created/update the value
   * @param value Value to be set on the property
   */
  public set(prop: string, value: any) {
    return this._state[prop] = value;
  }

  /**
   * Removes the property on the state
   * @param prop Property to be removed
   */
  public remove(prop: string) {
    return this._state[prop] = null;
  }

  /**
   * Returns true when the property is registered on the state
   * @param prop Property to be checked
   */
  public has(prop: string): boolean {
    return !isNullOrUndefined(this._state[prop]);
  }

  /**
   * Clone the current state so that we won't touch the original state
   */
  private _clone(object: InternalStateType) {
    return JSON.parse(JSON.stringify( object ));
  }
}

import { Injectable } from '@angular/core';
import { AppState } from '../../app.service';

@Injectable()
export class MscStorageService {
  /**
   * User ID
   */
  private _userId: any;
  public get userId(): any {
    return this._userId;
  }
  public set userId(v: any) {
    this._userId = v;
  }

  constructor(private _appState: AppState) {
    // Get User ID from AppState
    this._userId = this._appState.get('userId');
  }

  /**
   * Set item to local storage
   * @param key Key string
   * @param value Object type value
   */
  public setItem<T>(key: string, value: T): void {
    let isUpdated: boolean = true;
    let localStorageKey: string = this.createLocalStorageKey(key);
    let item = this.getItem(localStorageKey);
    // Compare Items
    if (item) {
      let result = JSON.stringify(value).localeCompare(JSON.stringify(item));
      if (result === 0) {
        isUpdated = false;
      }
    }
    // Save item to local storage
    if (isUpdated) {
      localStorage.setItem(localStorageKey, JSON.stringify(value));
    }
  }

  /**
   * Get item to local storage
   * @param key Key string
   */
  public getItem<T>(key: string): T {
    let value: T;
    let localItem: string;
    let localStorageKey: string = this.createLocalStorageKey(key);

    // Get Item from local storage
    localItem = localStorage.getItem(localStorageKey);
    if (localItem) {
      value = JSON.parse(localItem);
    }
    return value;
  }

  /**
   * Remove item from local storage
   * @param key Key string
   */
  public removeItem(key: string): void {
    let localStorageKey: string = this.createLocalStorageKey(key);
    localStorage.removeItem(localStorageKey);
  }

  /**
   * Clear all record items in local storage
   */
  public clearRecord(): void {
    localStorage.clear();
  }

  /**
   * Create local storage key based on userid
   * @param key Key string
   */
  public createLocalStorageKey(key: string): string {
    let localStorageKey: string = '';

    // Create Key
    localStorageKey = this._userId + '_' + key;
    return localStorageKey;
  }
}

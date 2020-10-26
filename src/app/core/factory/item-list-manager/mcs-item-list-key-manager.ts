import { Subject } from 'rxjs';

import { QueryList } from '@angular/core';
import {
  isNullOrEmpty,
  KeyboardKey
} from '@app/utilities';

import { McsItemListManager } from '../item-list-manager/mcs-item-list-manager';

export class McsItemListKeyManager<T> extends McsItemListManager<T> {
  /**
   * Tab pressed event
   */
  public tabPressed: Subject<number> = new Subject();

  private _keyEventMaps = new Map<KeyboardKey, () => void>();

  constructor(_items: QueryList<T>) {
    super(_items);
    this._registerKeyboardEvents();
  }

  /**
   * Registers the keyboards event and notify active item change event
   * @param _event Keyboard event to be checked
   */
  public onKeyDown(_event: KeyboardEvent): void {
    if (isNullOrEmpty(_event)) { return; }
    // Invoke corresponding event when key code was found
    let keyCodeExist = this._keyEventMaps.has(_event.keyboardKey());
    if (keyCodeExist) {
      this._keyEventMaps.get(_event.keyboardKey())();
      _event.preventDefault();
    }
  }

  /**
   * Registers the keyboard events based on their specific functionalities
   */
  private _registerKeyboardEvents(): void {
    this._keyEventMaps.set(KeyboardKey.DownArrow, this.setNextItemActive.bind(this));
    this._keyEventMaps.set(KeyboardKey.RightArrow, this.setNextItemActive.bind(this));
    this._keyEventMaps.set(KeyboardKey.UpArrow, this.setPreviousItemActive.bind(this));
    this._keyEventMaps.set(KeyboardKey.LeftArrow, this.setPreviousItemActive.bind(this));
    this._keyEventMaps.set(KeyboardKey.Home, this.setFirstItemActive.bind(this));
    this._keyEventMaps.set(KeyboardKey.End, this.setLastItemActive.bind(this));
    this._keyEventMaps.set(KeyboardKey.Tab, this._notifyTabPressed.bind(this));
  }

  /**
   * Notify tab subscribers when tab is pressed
   */
  private _notifyTabPressed(): void {
    this.tabPressed.next(KeyboardKey.Tab);
  }
}

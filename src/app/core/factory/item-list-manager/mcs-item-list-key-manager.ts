import { QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { isNullOrEmpty } from '../../../utilities';
import { Key } from '../../enumerations/mcs-key.enum';
import { McsItemListManager } from './mcs-item-list-manager';

export class McsItemListKeyManager<T> extends McsItemListManager<T> {
  /**
   * Tab pressed event
   */
  public tabPressed: Subject<number> = new Subject();

  private _keyEventMaps = new Map<Key, () => void>();

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
    let keyCodeExist = this._keyEventMaps.has(_event.keyCode);
    if (keyCodeExist) {
      this._keyEventMaps.get(_event.keyCode)();
      _event.preventDefault();
    }
  }

  /**
   * Registers the keyboard events based on their specific functionalities
   */
  private _registerKeyboardEvents(): void {
    this._keyEventMaps.set(Key.DownArrow, this.setNextItemActive.bind(this));
    this._keyEventMaps.set(Key.RightArrow, this.setNextItemActive.bind(this));
    this._keyEventMaps.set(Key.UpArrow, this.setPreviousItemActive.bind(this));
    this._keyEventMaps.set(Key.LeftArrow, this.setPreviousItemActive.bind(this));
    this._keyEventMaps.set(Key.Home, this.setFirstItemActive.bind(this));
    this._keyEventMaps.set(Key.End, this.setLastItemActive.bind(this));
    this._keyEventMaps.set(Key.Tab, this._notifyTabPressed.bind(this));
  }

  /**
   * Notify tab subscribers when tab is pressed
   */
  private _notifyTabPressed(): void {
    this.tabPressed.next(Key.Tab);
  }
}

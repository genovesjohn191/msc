import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { McsListPanelItem } from '../../core';
import { isNullOrEmpty } from '../../utilities';

@Injectable()
export class ListPanelService {

  /**
   * Stream for the item selection changed event
   */
  private _selectedItemChangedStream: Subject<McsListPanelItem>;
  public get selectedItemChangedStream(): Subject<McsListPanelItem> {
    return this._selectedItemChangedStream;
  }
  public set selectedItemChangedStream(value: Subject<McsListPanelItem>) {
    this._selectedItemChangedStream = value;
  }

  /**
   * Selected item from the stream
   */
  private _selectedItem: McsListPanelItem;
  public get selectedItem(): McsListPanelItem {
    return this._selectedItem;
  }
  public set selectedItem(value: McsListPanelItem) {
    this._selectedItem = value;
  }

  constructor() {
    this._selectedItemChangedStream = new Subject();
    this._setSelectedItem();
  }

  /**
   * Select the inputted element and notify all the stream subscribers
   * @param item Item to be selected
   */
  public selectItem(item: McsListPanelItem): void {
    if (isNullOrEmpty(item)) { return; }
    this._selectedItemChangedStream.next(item);
  }

  /**
   * Set the selected item to selected item variable
   */
  private _setSelectedItem(): void {
    this._selectedItemChangedStream.subscribe((item) => {
      this._selectedItem = item;
    });
  }
}

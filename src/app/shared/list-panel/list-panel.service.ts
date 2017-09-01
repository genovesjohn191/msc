import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { McsListPanelItem } from '../../core';

@Injectable()
export class ListPanelService {

  /**
   * Stream for the item selection changed event
   */
  private _selectedItemChangedStream: BehaviorSubject<McsListPanelItem>;
  public get selectedItemChangedStream(): BehaviorSubject<McsListPanelItem> {
    return this._selectedItemChangedStream;
  }
  public set selectedItemChangedStream(value: BehaviorSubject<McsListPanelItem>) {
    this._selectedItemChangedStream = value;
  }

  constructor() {
    this._selectedItemChangedStream = new BehaviorSubject(undefined);
  }
}

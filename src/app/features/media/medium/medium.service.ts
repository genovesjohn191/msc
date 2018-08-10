import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Media } from '../models';

@Injectable()
export class MediumService {
  private _selectedMediumChange: BehaviorSubject<Media>;

  constructor() {
    this._selectedMediumChange = new BehaviorSubject<Media>(undefined);
  }

  /**
   * Event that emits when the selected item has been changed
   */
  public selectedMediumChange(): Observable<Media> {
    return this._selectedMediumChange.pipe(distinctUntilChanged());
  }

  /**
   * Sets the selected medium and notify it's event subscribers
   * @param medium Medium to be selected
   */
  public setSelectedMedium(medium: Media): void {
    this._selectedMediumChange.next(medium);
  }
}

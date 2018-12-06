import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  distinctUntilChanged,
  filter
} from 'rxjs/operators';
import { McsResourceMedia } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class MediumService {
  private _selectedMediumChange: BehaviorSubject<McsResourceMedia>;

  constructor() {
    this._selectedMediumChange = new BehaviorSubject<McsResourceMedia>(undefined);
  }

  /**
   * Event that emits when the selected item has been changed
   */
  public selectedMediumChange(): Observable<McsResourceMedia> {
    return this._selectedMediumChange.pipe(
      distinctUntilChanged(),
      filter((medium) => !isNullOrEmpty(medium))
    );
  }

  /**
   * Sets the selected medium and notify it's event subscribers
   * @param medium Medium to be selected
   */
  public setSelectedMedium(medium: McsResourceMedia): void {
    this._selectedMediumChange.next(medium);
  }
}

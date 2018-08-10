import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  unsubscribeSubject,
  isNullOrEmpty
} from '../../../utilities';
import { Media } from '../models';
import { MediumService } from './medium.service';

export abstract class MediumDetailsBase {
  public selectedMedium: Media;
  private _baseDestroySubject = new Subject<void>();

  constructor(protected _mediumService: MediumService) {
    this.selectedMedium = new Media();
  }

  /**
   * Initializes the based class implementation
   */
  protected initializeBase(): void {
    this._listenToMediaSelectionChange();
  }

  /**
   * Destroys all the resources of the base class
   */
  protected destroyBase(): void {
    unsubscribeSubject(this._baseDestroySubject);
  }

  protected abstract mediumSelectionChange(): void;

  /**
   * Listens to media selection change
   */
  private _listenToMediaSelectionChange(): void {
    this._mediumService.selectedMediumChange()
      .pipe(takeUntil(this._baseDestroySubject))
      .subscribe((_medium) => {
        if (isNullOrEmpty(_medium)) { return; }
        this.selectedMedium = _medium;
        this.mediumSelectionChange();
      });
  }
}

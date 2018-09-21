import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  unsubscribeSubject,
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  McsJob,
  McsResourceMedia
} from '@app/models';
import { MediumService } from './medium.service';

export abstract class MediumDetailsBase {
  public selectedMedium: McsResourceMedia;
  private _baseDestroySubject = new Subject<void>();

  constructor(protected _mediumService: MediumService) {
    this.selectedMedium = new McsResourceMedia();
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

  /**
   * Returns true when the active job is based on currently selected media
   * @param mediaJob Job to be checked for the active media
   */
  protected isMediaActive(mediaJob: McsJob): boolean {
    if (isNullOrEmpty(mediaJob) || isNullOrEmpty(this.selectedMedium)) { return false; }
    let jobMediaId = getSafeProperty(mediaJob, (obj) => obj.clientReferenceObject.mediaId);
    let selectedMediaId = getSafeProperty(this.selectedMedium, (obj) => obj.id);
    let isActive = jobMediaId === selectedMediaId;
    return isActive;
  }

  /**
   * Set selected medium state (true: spinner, false: normal)
   * @param state State to be set in the processing flag of media
   */
  protected setSelectedMediumState(state: boolean): void {
    if (isNullOrEmpty(this.selectedMedium)) { return; }
    this.selectedMedium.isProcessing = state;
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

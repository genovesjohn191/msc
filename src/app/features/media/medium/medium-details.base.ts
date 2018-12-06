import {
  Subject,
  Observable
} from 'rxjs';
import {
  tap,
  shareReplay
} from 'rxjs/operators';
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
  public selectedMedium$: Observable<McsResourceMedia>;
  private _baseDestroySubject = new Subject<void>();

  constructor(protected _mediumService: MediumService) { }

  /**
   * Initializes the based class implementation
   */
  protected initializeBase(): void {
    this._subscribeToMediaSelectionChange();
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
  protected isMediaActive(selectedMedium: McsResourceMedia, mediaJob: McsJob): boolean {
    if (isNullOrEmpty(mediaJob) || isNullOrEmpty(selectedMedium)) { return false; }
    let jobMediaId = getSafeProperty(mediaJob, (obj) => obj.clientReferenceObject.mediaId);
    let selectedMediaId = getSafeProperty(selectedMedium, (obj) => obj.id);
    let isActive = jobMediaId === selectedMediaId;
    return isActive;
  }

  /**
   * Set selected medium state (true: spinner, false: normal)
   * @param state State to be set in the processing flag of media
   */
  protected setSelectedMediumState(selectedMedium: McsResourceMedia, state: boolean): void {
    if (isNullOrEmpty(selectedMedium)) { return; }
    selectedMedium.isProcessing = state;
  }

  protected abstract mediumSelectionChange(medium: McsResourceMedia): void;

  /**
   * Listens to media selection change
   */
  private _subscribeToMediaSelectionChange(): void {
    this.selectedMedium$ = this._mediumService.selectedMediumChange().pipe(
      tap((medium) => this.mediumSelectionChange(medium)),
      shareReplay(1)
    );
  }
}

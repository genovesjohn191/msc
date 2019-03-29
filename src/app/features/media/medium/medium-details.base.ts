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
   * Returns true when media is active by the job
   * @param job Job to be the basis of the media
   */
  protected isMediaActiveByJob(job: McsJob): boolean {
    if (isNullOrEmpty(job) || isNullOrEmpty(this._mediumService.getMediaId())) { return false; }
    return getSafeProperty(job, (obj) => obj.clientReferenceObject.mediaId) === this._mediumService.getMediaId();
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

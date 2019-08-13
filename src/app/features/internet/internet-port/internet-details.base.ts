import {
  Observable,
  Subject
} from 'rxjs';
import {
  tap,
  shareReplay
} from 'rxjs/operators';
import { McsInternetPort } from '@app/models';
import {
  unsubscribeSubject,
  isNullOrEmpty
} from '@app/utilities';
import { InternetPortService } from './internet-port.service';

export abstract class InternetPortDetailsBase {
  public selectedInternetPort$: Observable<McsInternetPort>;
  private _baseDestroySubject = new Subject<void>();

  constructor(protected _internetPortService: InternetPortService) { }

  /**
   * Initializes the based class implementation
   */
  protected initializeBase(): void {
    this._subscribeToInternetPortSelectionChange();
  }

  /**
   * Destroys all the resources of the base class
   */
  protected destroyBase(): void {
    unsubscribeSubject(this._baseDestroySubject);
  }

  /**
   * Set selected internet port state (true: spinner, false: normal)
   * @param state State to be set in the processing flag of internet port
   */
  protected setSelectedInternetPortState(selectedInternetPort: McsInternetPort, state: boolean): void {
    if (isNullOrEmpty(selectedInternetPort)) { return; }
    selectedInternetPort.isProcessing = state;
  }

  protected abstract internetPortSelectionChange(internetPort: McsInternetPort): void;

  /**
   * Listens to internet port selection change
   */
  private _subscribeToInternetPortSelectionChange(): void {
    this.selectedInternetPort$ = this._internetPortService.selectedInternetPortChange().pipe(
      tap((internetPort) => this.internetPortSelectionChange(internetPort)),
      shareReplay(1)
    );
  }
}

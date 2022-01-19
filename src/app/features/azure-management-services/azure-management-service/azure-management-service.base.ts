import {
  Observable,
  Subject
} from 'rxjs';
import {
  tap,
  shareReplay
} from 'rxjs/operators';
import { McsAzureManagementService } from '@app/models';
import {
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import { AzureManagementServiceService } from './azure-management-service.service';

export abstract class AzureManagementServiceDetailsBase {
  public selectedAzureManagementService$: Observable<McsAzureManagementService>;
  private _baseDestroySubject = new Subject<void>();

  constructor(protected _azureManagementServiceService: AzureManagementServiceService) { }

  /**
   * Initializes the based class implementation
   */
  protected initializeBase(): void {
    this._subscribeToAzureManagementServiceSelectionChange();
  }

  /**
   * Destroys all the resources of the base class
   */
  protected destroyBase(): void {
    unsubscribeSafely(this._baseDestroySubject);
  }

  /**
   * Set selected Azure Management Service state (true: spinner, false: normal)
   * @param state State to be set in the processing flag of Azure Management Service
   */
  protected setSelectedAzureManagementServiceState(azureManagementService: McsAzureManagementService, state: boolean): void {
    if (isNullOrEmpty(azureManagementService)) { return; }
    azureManagementService.isProcessing = state;
  }

  protected abstract azureManagementServiceSelectionChange(azureManagementService: McsAzureManagementService): void;

  /**
   * Listens to Azure Management Service selection change
   */
  private _subscribeToAzureManagementServiceSelectionChange(): void {
    this.selectedAzureManagementService$ = this._azureManagementServiceService.selectedAzureManagementServiceChange().pipe(
      tap((azureManagementService) => this.azureManagementServiceSelectionChange(azureManagementService)),
      shareReplay(1)
    );
  }
}

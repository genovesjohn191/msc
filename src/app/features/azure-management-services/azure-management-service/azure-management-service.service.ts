import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { McsAzureManagementService } from '@app/models';
import {
  distinctUntilChanged,
  filter
} from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class AzureManagementServiceService {
  public _selectedAzureManagementServiceChange: BehaviorSubject<McsAzureManagementService>;
  private _azureManagementServiceId: string;

  constructor() {
    this._selectedAzureManagementServiceChange = new BehaviorSubject<McsAzureManagementService>(null);
  }

  /**
   * Event that emits when the selected item has been changed
   */
  public selectedAzureManagementServiceChange(): Observable<McsAzureManagementService> {
    return this._selectedAzureManagementServiceChange.asObservable().pipe(
      distinctUntilChanged(),
      filter((azureManagementService) => !isNullOrEmpty(azureManagementService))
    );
  }

  /**
   * Set management service data to the stream (MCS API response)
   * @param azureManagementService selected Azure Management Service
   */
  public setSelectedAzureManagementService(azureManagementService: McsAzureManagementService): void {
    this._selectedAzureManagementServiceChange.next(azureManagementService);
  }

  /**
   * Sets the management service id based on the provided string
   * @param azureManagementServiceId Azure Management Service id to be set
   */
  public setAzureManagementServiceId(azureManagementServiceId: string): void {
    this._azureManagementServiceId = azureManagementServiceId;
  }

  /**
   * Returns the Azure Management Service id
   */
  public getAzureManagementServiceId(): string {
    return this._azureManagementServiceId;
  }
}

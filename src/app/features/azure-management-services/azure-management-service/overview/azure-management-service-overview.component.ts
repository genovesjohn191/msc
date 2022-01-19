import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import {
  McsAzureManagementService,
  inviewLevelText
} from '@app/models';
import { AzureManagementServiceService } from '../azure-management-service.service';
import { AzureManagementServiceDetailsBase } from '../azure-management-service.base';


@Component({
  selector: 'mcs-azure-management-service-overview',
  templateUrl: './azure-management-service-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AzureManagementServiceOverviewComponent extends AzureManagementServiceDetailsBase implements OnInit, OnDestroy {

  constructor(
    _azureManagementServiceService: AzureManagementServiceService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    super(_azureManagementServiceService);
  }

  public ngOnInit(): void {
    this.initializeBase();
  }

  public ngOnDestroy(): void {
    this.destroyBase();
  }

  /**
   * Event that will automatically invoked when the Azure Management Service selection has been changed
   */
  protected azureManagementServiceSelectionChange(): void {
    this._changeDetectorRef.markForCheck();
  }
}

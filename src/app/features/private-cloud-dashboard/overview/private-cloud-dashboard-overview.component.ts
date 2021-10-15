import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation
} from '@angular/core';

import {
  McsAccessControlService,
  McsAuthenticationIdentity,
  McsNavigationService
} from '@app/core';
import {
  McsPermission,
  RouteKey
} from '@app/models';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-private-cloud-dashboard-overview',
  templateUrl: './private-cloud-dashboard-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class PrivateCloudDashboardOverviewComponent {
  public constructor(
    private _accessControlService: McsAccessControlService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _navigationService: McsNavigationService,
  ) {}

  public get arrowDropDownBlackIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ARROW_DROP_DOWN_BLACK;
  }

  public get hasPrivateAndPublicCloudAccess(): boolean {
    return this._authenticationIdentity.platformSettings.hasPublicCloud &&
      this._authenticationIdentity.platformSettings.hasPrivateCloud;
  }

  public get hasCloudVmAccess(): boolean {
    return this._accessControlService.hasPermission([McsPermission.CloudVmAccess]);
  }

  public onClickPublicCloud(): void {
    this._navigationService.navigateTo(RouteKey.ReportOverview);
  }

  public onClickPrivateCloud(): void {
    this._navigationService.navigateTo(RouteKey.PrivateCloudDashboardOverview);
  }
}
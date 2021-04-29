import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { McsTerraformDeployment } from '@app/models';

@Component({
  selector: 'mcs-azure-deployment-overview',
  templateUrl: './azure-deployment-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentOverviewComponent {
  // @Input()
  // public get deployment(): McsTerraformDeployment {
  //   return this._deployment;
  // }
  // public set deployment(val: McsTerraformDeployment) {
  //   this._deployment = val;
  // }

  // private _deployment: McsTerraformDeployment;
}
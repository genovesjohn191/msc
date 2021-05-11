import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { McsTerraformDeployment } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

export interface TerraformDeploymentRenameDialogData {
  title: string;
  deployment: McsTerraformDeployment,
  newName: string;
}

@Component({
  selector: 'mcs-terraform-deployment-rename-dialog.component',
  templateUrl: './terraform-deployment-rename-dialog.component.html'
})
export class TerraformDeploymentRenameDialogComponent {
  public maxDeploymentNameLength: number = 255;

  public get valid(): boolean {
    return !isNullOrEmpty(this.data.newName) && this.data.newName !== this.data.deployment.name;
  };

  public constructor(
    public dialogRef: MatDialogRef<TerraformDeploymentRenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TerraformDeploymentRenameDialogData
  ) {}

}

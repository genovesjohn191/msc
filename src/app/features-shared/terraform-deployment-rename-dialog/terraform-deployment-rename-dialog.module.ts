import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { TerraformDeploymentRenameDialogComponent } from './terraform-deployment-rename-dialog.component';

@NgModule({
  declarations: [
    TerraformDeploymentRenameDialogComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule
  ],
  exports: [
    TerraformDeploymentRenameDialogComponent
  ]
})
export class TerraformDeploymentRenameDialogModule { }

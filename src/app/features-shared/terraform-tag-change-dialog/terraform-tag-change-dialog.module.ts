import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { TerraformTagChangeDialogComponent } from './terraform-tag-change-dialog.component';

@NgModule({
  declarations: [
    TerraformTagChangeDialogComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule
  ],
  exports: [
    TerraformTagChangeDialogComponent
  ]
})
export class TerraformTagChangeDialogModule { }

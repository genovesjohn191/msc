import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { DynamicFormComponent, DynamicFormModule } from '../dynamic-form';
import { TerraformTagChangeDialogComponent } from './terraform-tag-change-dialog.component';

@NgModule({
  declarations: [
    TerraformTagChangeDialogComponent
  ],
  imports: [
    SharedModule,
    DynamicFormModule,
    ReactiveFormsModule
  ],
  exports: [
    DynamicFormComponent,
    TerraformTagChangeDialogComponent
  ],
  entryComponents: [ TerraformTagChangeDialogComponent ],
})
export class TerraformTagChangeDialogModule { }

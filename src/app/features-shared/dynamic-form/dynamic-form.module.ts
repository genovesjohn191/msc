import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import {
  DynamicSelectPodsService,
  DynamicSelectResourceGroupService
} from './dynamic-form-field';
import { DynamicFormFieldModule } from './dynamic-form-field/dynamic-form-field.module';
import { DynamicFormValidationService } from './dynamic-form-validation.service';
import { DynamicFormComponent } from './dynamic-form.component';

@NgModule({
declarations: [
    DynamicFormComponent
  ],
  imports: [
    SharedModule,
    DynamicFormFieldModule,
    ReactiveFormsModule
  ],
  exports: [
    DynamicFormComponent
  ],
  providers: [
    DynamicFormFieldModule,
    DynamicFormValidationService,
    DynamicSelectResourceGroupService,
    DynamicSelectPodsService
  ]
})
export class DynamicFormModule { }

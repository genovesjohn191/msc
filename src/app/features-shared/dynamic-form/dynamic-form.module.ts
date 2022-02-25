import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';

import { DynamicFormFieldModule } from './dynamic-form-field/dynamic-form-field.module';
import { DynamicSelectResourceGroupService } from './dynamic-form-field/dynamic-select-resource-group.service';
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
  entryComponents: [ DynamicFormComponent ],
  providers: [
    DynamicFormFieldModule,
    DynamicFormValidationService,
    DynamicSelectResourceGroupService
  ]
})
export class DynamicFormModule { }

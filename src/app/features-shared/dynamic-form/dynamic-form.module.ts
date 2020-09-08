import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { MatFormFieldModule, MatSelectModule, MatOptionModule, MatInputModule, MatButtonModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormFieldModule } from './dynamic-form-field/dynamic-form-field.module';
import { DynamicFormComponent } from './dynamic-form.component';

@NgModule({
  declarations: [
    DynamicFormComponent
  ],
  imports: [
    SharedModule,
    DynamicFormFieldModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatButtonModule
  ],
  exports: [
    DynamicFormComponent
  ],
  providers: [ DynamicFormFieldModule ]
})
export class DynamicFormModule { }

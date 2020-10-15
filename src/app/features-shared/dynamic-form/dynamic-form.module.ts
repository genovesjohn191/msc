import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from '@app/shared/shared.module';

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
  entryComponents: [ DynamicFormComponent ],
  providers: [ DynamicFormFieldModule ]
})
export class DynamicFormModule { }
